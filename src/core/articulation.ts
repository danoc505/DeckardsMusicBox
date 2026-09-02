/**
 * THE MANNER. How a note is played, as distinct from which note it is.
 *
 * "Articulation is the way in which a specific note or group of notes should
 * be performed beyond the basics of pitch, duration and dynamic"
 * (hellomusictheory.com/learn/articulation). It divides in two, and both
 * halves are here: what it does to the note's WRITTEN LENGTH — legato,
 * staccato, tenuto, portato — and what it does to HOW THE NOTE IS PLAYED —
 * accents and playing techniques (en.wikipedia.org/wiki/Staccato;
 * en.wikipedia.org/wiki/Legato).
 *
 * Until this existed a note in this program was a rectangle: a pitch, a
 * length and a weight. Every note was struck the same way, so a record's only
 * variety was which pitches it chose — and the notation a guitarist actually
 * reads is almost entirely the other thing. A tab is mostly `p`, `h`, `/`,
 * `\`, `b` and repeat counts: pull-offs, hammer-ons, slides, bends. A riff
 * can be one gesture repeated on two pitches and still be the part everyone
 * knows. The music is in the attack.
 *
 * THE NUMBERS ARE THE PUBLISHED ONES. Duration as a share of the written
 * value: legato 100% and "no intervening silence", tenuto 95%, non-legato
 * 80%, portato 75%, mezzo-staccato 65%, staccato "about 50% of its notated
 * value", martellato 33%, staccatissimo 25–33%
 * (cmuse.org/staccato-length-calculator; en.wikipedia.org/wiki/Legato).
 * PLAIN is the non-legato 80%, because an unmarked note is not a slurred one.
 *
 * Weight: ghost notes sit at 30–50 of a MIDI scale whose ordinary hits are
 * 90–100 — "well below half" — and accents at or above 100
 * (blog.samplefocus.com/how-to-produce-ghost-notes-for-organic-drums;
 * mastering.com/program-realistic-midi-drums).
 *
 * Attack: "a hammer-on removes the sound of the pick attack, yielding a
 * softer, more rounded tone" (en.wikipedia.org/wiki/Hammer-on), and a passage
 * played that way is a legato phrase. So SLUR keeps a sixth of the transient
 * and holds its full length; that is one number doing what the technique
 * physically does.
 *
 * Pitch: a bend "increases the pitch of a note" by displacing the string
 * (en.wikipedia.org/wiki/String_bending), and bend duration "is largely a
 * matter of expressive choice ... with no fixed millisecond standard", so the
 * reach is [chosen] at the short end of what a hand can do. A whole tone is the
 * commonest bend a guitarist writes.
 */

export const ARTS = [
  "plain", "tenuto", "staccato", "marcato", "ghost", "accent", "slur", "slide", "bend", "tremolo",
] as const;
export type ArtName = (typeof ARTS)[number];

export interface Art {
  readonly name: ArtName;
  /** Share of the written length the note sounds for. 1 leaves no gap before the next. */
  readonly hold: number;
  /** Multiplier on the note's own weight. */
  readonly weigh: number;
  /** 0..1, how much of the attack transient survives. 1 is struck plain; 0 is slurred in. */
  readonly attack: number;
  /** Semitones the pitch starts away from its target, and arrives from. */
  readonly from: number;
  /** Semitones the pitch bends away from its target during the note, and stays. */
  readonly bend: number;
  /** Seconds a `from` or a `bend` takes to travel. */
  readonly reachSec: number;
  /** How many times the note is struck across its length. 1 is once. */
  readonly strikes: number;
  /** 0..1, how much of the top end is taken off: a palm on the strings. */
  readonly damp: number;
}

const art = (name: ArtName, o: Partial<Omit<Art, "name">>): Art => Object.freeze({
  name, hold: 0.8, weigh: 1, attack: 1, from: 0, bend: 0, reachSec: 0.07, strikes: 1, damp: 0, ...o,
});

/**
 * The manners, by name. A genre draws from these by weight and a part may
 * only be given one its instrument could physically produce — a struck piano
 * does not bend, and the tables that say so live with the parts.
 */
export const ART: Readonly<Record<ArtName, Art>> = Object.freeze({
  /** An unmarked note: the 80% of non-legato, with its fifth of a gap. */
  plain: art("plain", {}),
  /** Held: 95%, "the importance of holding out a note". */
  tenuto: art("tenuto", { hold: 0.95, weigh: 1.05 }),
  /** "A note of shortened duration, separated from the note that may follow by silence." */
  staccato: art("staccato", { hold: 0.5 }),
  /** Struck hard and short — martellato's 33%, hammered. */
  marcato: art("marcato", { hold: 0.33, weigh: 1.18 }),
  /** Well below half, and dull with it: a stick dropped on a head, not struck. */
  ghost: art("ghost", { hold: 0.5, weigh: 0.4, attack: 0.7, damp: 0.55 }),
  /** Louder than its neighbours, which is the whole of what an accent is. */
  accent: art("accent", { weigh: 1.25 }),
  /** Hammered on or pulled off: no pick attack, and no silence before the next. */
  slur: art("slur", { hold: 1, weigh: 0.9, attack: 0.16 }),
  /** Arrived at from a tone below, the way a finger slides up into a note. */
  slide: art("slide", { hold: 0.9, from: -2, reachSec: 0.09, attack: 0.55 }),
  /** Bent a whole tone up and held there. */
  bend: art("bend", { hold: 0.95, bend: 2, reachSec: 0.12 }),
  /** Re-struck across its length: tremolo picking, or a roll. */
  tremolo: art("tremolo", { hold: 0.95, strikes: 4, weigh: 0.85 }),
});

export const PLAIN = ART.plain;

/** A manner by name, or the plain one. */
export const artOf = (name: ArtName): Art => ART[name] ?? PLAIN;

/**
 * Does this manner change how the note SOUNDS, or only how loud and how long
 * it is? The sound stage renders a note once per distinct manner, so a
 * manner that only scales weight and length must not multiply the cache.
 */
export const shapesTheNote = (a: Art): boolean =>
  a.attack !== 1 || a.from !== 0 || a.bend !== 0 || a.strikes !== 1 || a.damp !== 0;
