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
}

/** What the form stage reads. Every function answered, every length a pool. */
export interface FormRules {
  readonly lengths: Readonly<Record<SectionFn, Weighted<number>>>;
  readonly idea: Readonly<Record<SectionFn, Idea>>;
  readonly energy: Readonly<Record<SectionFn, number>>;
  readonly next: Readonly<Record<SectionFn, Weighted<SectionFn>>>;
  readonly introChance: number;
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
  /** The changes each idea may stand on. */
  readonly progressions?: Readonly<Partial<Record<Idea, Weighted<Progression>>>>;
  /** 0..1, how often a chord takes its seventh. */
  readonly sevenths?: number;
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
 * next, which is the thing that makes a saxophone line and a riff guitar and
 * a chanted vocal three different kinds of melody rather than one process
 * with different pools.
 *
 * Measured off the examples, as interval histograms of the top voice:
 *
 *   sung    conjunct. Shine On's saxophone is -2 26%, -3 18%, +2 16%, +3 11%
 *           and leaps 13% of the time; Televators' vocal is -2 25%, +2 17%.
 *           "In conjunct melodic motion, the melodic phrase moves in a
 *           stepwise fashion" (en.wikipedia.org/wiki/Melodic_motion).
 *   riff    disjunct. Shine On's clean electric is -7 16%, -5 9%, +7 6%,
 *           +14 6% and leaps 79% of the time: it is not a melody that leaps,
 *           it is a chord played one note at a time.
 *   chant   a reciting tone. Chop Suey's vocal repeats its own pitch 44% of
 *           the time. Chant is "the rhythmic speaking or singing of words or
 *           sounds, often primarily on one or two pitches (reciting tones)"
 *           (en.wikipedia.org/wiki/Reciting_tone; newworldencyclopedia.org,
 *           "Chant"), and the technique of holding one has its own name,
 *           repercussion (en.wikipedia.org/wiki/Repercussion_(singing)).
 *           This program used to forbid it outright.
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

/** What a drone sits on: the key's tonic, or the fifth above it. */
export const DRONE_TONES = ["tonic", "fifth"] as const;
export type DroneTone = (typeof DRONE_TONES)[number];

export interface DroneSpec {
  readonly register?: Register;
  /** Which tone of the KEY it holds — never of the chord; a drone does not follow the changes. */
  readonly tone?: Weighted<DroneTone>;
  /** How many bars one tone is held for, drawn once per material. */
  readonly hold?: Weighted<number>;
  /** How often each manner is reached for. Only what the instrument can do. */
  readonly art?: ArtSpec;
}

export interface DroneRules {
  readonly register: Register;
  readonly tone: Weighted<DroneTone>;
  readonly hold: Weighted<number>;
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

export interface ArrangementSpec {
  /**
   * The order the parts arrive in across a record. Every part appears exactly
   * once — a part left out would never enter, and that is refused at load.
   */
  readonly enter?: readonly Role[];
  /** How many of them, from the front of `enter`, an intro holds. */
  readonly introParts?: number;
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
}

export interface ArrangementRules {
  readonly enter: readonly Role[];
  readonly introParts: number;
  readonly fewest: number;
  readonly shed: readonly Role[];
  readonly fullAbove: number;
  readonly thinBelow: number;
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
 * Every instrument can be struck plain, held, cut short or leant on, so those
 * are not listed: they are the floor, and they are only weight and length.
 */
export const FLOOR: readonly ArtName[] = Object.freeze(["plain", "tenuto", "staccato", "marcato", "accent"]);

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

/** THE PEDAL BOARD, in the order a signal walks it. Mix 0 is a pedal switched off. */
export interface PedalsSpec {
  readonly wah?: { readonly rateHz?: number; readonly depth?: number; readonly mix?: number };
  readonly overdrive?: { readonly drive?: number; readonly tone?: number; readonly mix?: number };
  readonly fuzz?: { readonly gain?: number; readonly mix?: number };
  readonly phaser?: { readonly rateHz?: number; readonly depth?: number; readonly mix?: number };
  readonly tremolo?: { readonly rateHz?: number; readonly depth?: number; readonly mix?: number };
}
export type PedalsRules = Total<PedalsSpec>;
export const PEDAL_ORDER = ["wah", "overdrive", "fuzz", "phaser", "tremolo"] as const satisfies readonly (keyof PedalsSpec)[];

/**
 * THE PATCH: the returns feeding each other. `patch[from][to]` is how much
 * of `from`'s output goes into `to`'s input — echo into the spring, the
 * spring into the room, the room back into the echo, or a unit into
 * itself. A dub desk. Feedback is real and one sample deep, held under
 * full scale in the loop and kept off DC, so a patch cannot run away.
 */
export type PatchSpec = Readonly<Partial<Record<Send, Readonly<Partial<Record<Send, number>>>>>>;
export type PatchRules = Readonly<Record<Send, Readonly<Record<Send, number>>>>;

export interface SoundSpec {
  readonly voices?: Readonly<Partial<Record<PitchedRole, VoiceName>>>;
  readonly rack?: RackSpec;
  readonly mix?: Readonly<Partial<Record<Role, ChannelSpec>>>;
  readonly world?: WorldSpec;
  readonly pedals?: PedalsSpec;
  readonly patch?: PatchSpec;
}

export interface SoundRules {
  readonly voices: Readonly<Record<PitchedRole, VoiceName>>;
  readonly rack: RackRules;
  readonly mix: Readonly<Record<Role, ChannelRules>>;
  readonly world: WorldRules;
  readonly pedals: PedalsRules;
  readonly patch: PatchRules;
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
  },

  harmony: {
    bars: 4,
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
     * The example tabs are made almost entirely of these four marks — the
     * pitches under them are few. Weights [chosen].
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
    hold: [
      [4, 4],
      [2, 2],
      [1, 1],
    ],
    /** A held tone is held: tenuto is 95% of the written value, and a drone means it. */
    art: [
      ["tenuto", 6],
      ["plain", 1],
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
     * No pure loop in the defaults: four A's is a thing a genre may want and
     * has to say. Offered here it was drawn one cycle in ten, and two in a
     * row turned a sixteen-bar chorus into four bars four times.
     */
    phrase: [
      [["A", "B", "A", "C"], 4],
      [["A", "A", "B", "D"], 3],
      [["A", "B", "A", "D"], 2],
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
    pedals: {
      wah: { rateHz: 1.2, depth: 0.7, mix: 0 },
      overdrive: { drive: 3, tone: 0.5, mix: 0 },
      fuzz: { gain: 6, mix: 0 },
      phaser: { rateHz: 0.4, depth: 0.7, mix: 0 },
      tremolo: { rateHz: 4.5, depth: 0.6, mix: 0 },
    },
  },
};
