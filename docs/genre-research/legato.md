# LEGATO — what "hold the key until the next one" actually means

*Researched 2026-08-08, on the user's instruction, before building the LEGATO
switch: "i dont understand why there cant be a switch for a keyboard to play in
legato i think thst would make the legto switch off then it clolides with the
next note".*

---

## 1. THE WORD

> Legato is when "musical notes are played or sung smoothly, such that the
> transition from note to note is made with **no intervening silence**."
> [[Wikipedia, *Legato*](https://en.wikipedia.org/wiki/Legato)]

So legato is not a tone, not a filter and not an envelope setting. **It is a
statement about the gap between two notes**, and the only way to remove a gap
is to make the first note last until the second one starts. The user's own
sentence — "it collides with the next note" — is the definition, and it is the
whole specification.

## 2. HOW A SEQUENCER DOES IT — the exact operation

Every DAW has this as one command, and they all describe it the same way:

> **Legato**: "Extends each selected note so that it reaches the next note."
> …"You can specify a gap or overlap for this function with the **Legato
> Overlap** setting in the Preferences dialog."
> [[Steinberg, *Cubase — Legato*](https://archive.steinberg.help/cubase_elements_le_ai/v9/en/cubase_nuendo/topics/midi_processing/midi_processing_legato_c.html)]

Two facts worth taking:

1. **It changes DURATION and nothing else.** No pitch moves, no note is added,
   no note is removed, nothing changes place. This is the reason it is allowed
   to be a switch on a rack rather than a genre table: it is an articulation,
   the same class of thing as `art`, `from`, `vib` and `tail`, which this
   program already carries on the note and already lets the performance stage
   decide.
2. **It is EXTEND, never shorten.** A note that already runs past the next one
   is already legato and the command leaves it alone. That matters here more
   than it does in a DAW, because — see §4 — most of this program's chords are
   already overlapping and the switch must not undo that.

Whether the two notes touch or overlap by a hair is a preference in Cubase and
a per-library question elsewhere ("some expect an overlap, some just trigger
the legato sample when the previous note ends a specific time before the next"
[[VI-CONTROL](https://vi-control.net/community/threads/overlap-to-get-legato-when-using-a-daw.25592/)]).
**We end the note exactly where the next one starts**, because that is the
plainest reading of "until it collides" and because none of our voices have a
legato sample layer to trigger.

## 3. THE ONE PLACE IT CANNOT MEAN "FOREVER"

A DAW's Legato command is applied to notes you selected, by a person looking at
them. A switch on a rack is applied to a whole part, unattended — including
across the silence where a part drops out for a section.

**Measured on this program** (§4): the answer part on `bladerunner` has a mean
gap of **19.6 seconds** between notes, and dungeon synth's is 17.2. That is not
one note leading into another; that is the player stopping and coming back.
Holding a key down for nineteen seconds is not legato, it is a drone, and it
would be reported as a bug the day it shipped.

So the hold is **capped at one bar**. Nothing in the sources says a bar; it is
the shortest cap that never shortens a real phrase, since a part playing a line
plays inside the bar by definition. Stated here as a decision rather than a
finding.

## 4. WHAT IS ALREADY LEGATO — measured before building anything

Mean seconds from one note's END to the next note's START, per part, per genre,
over the shipped songs. **Negative means the note is still sounding when the
next one starts** — already legato, nothing for the switch to do.

| genre | chords | chords 2 | tune | answer | figure | bass |
|---|---|---|---|---|---|---|
| lofi         | **−1.371** |  1.598 | 0.556 |  —     | —      |  0.828 |
| synthwave    | **−0.831** |  —     | 0.408 |  0.717 | 0.000  |  0.176 |
| dkc          | **−1.155** |  —     | 0.881 | 10.240 | 0.000  |  0.631 |
| bladerunner  | **−1.813** |  0.517 | 1.572 | 19.594 | 0.000  | **−11.888** |
| acid         |  0.000 |  —     | 0.759 |  —     | —      |  0.121 |
| plastikman   | **−0.489** |  —     | —     |  —     | **−0.000** | **−0.271** |
| jungle       | **−0.382** |  —     | —     |  —     | —      | **−0.532** |
| dungeonsynth | **−0.000** |  3.121 | 2.258 | 17.160 | 0.162  | **−10.586** |

**The user was half right, and the useful half is which half.** "Naturally some
songs should already be using legato" — yes: **the CHORDS overlap on seven of
the eight genres**, and the bass does on four. What does not is every part that
carries a LINE — the tune, the answer, and the second keyboard — which are
exactly the parts a keyboard player would slur.

So the switch has something to do on `tune`, `answer`, `chords 2` and `figure`,
and on `chords` it will mostly do nothing, which is correct and is why it
extends rather than sets.

## 5. WHAT THIS DECIDES

1. **One field on the note**: how long the key COULD stay down — the distance
   to this part's next note, capped at a bar. Derived in the performance stage,
   where every other duration is decided, from notes that do not move. [§2.1]
2. **The switch does not compose.** It is read at DISPATCH, the one place both
   the live pump and the offline render hand a note to a voice, so a hand on it
   changes the next note about a second later and changes a bounce identically.
3. **EXTEND ONLY** — `max(what the note is, how long it could hold)` — so the
   seven genres whose chords already overlap sound exactly as they did. [§2.2]
4. **Per PART, on the strip that already owns that part**, and only on parts
   that play pitches. A drum has no next note to reach and a legato hi-hat is
   not a thing.

---

## 6. WHAT IT ACTUALLY MOVES, MEASURED AFTER BUILDING IT

Two numbers from the harness, both worth keeping because both were surprises.

**How many notes could be held at all** — `mk2_test`, 3 seeds × 8 genres:
**20 156 of 51 463**, or 39%. Per part: bass 9572, figure 6286, tune 1708,
chords 1401, chords 2 988, answer 201. The bass leads that list even though its
mean gap is small, because it plays the most notes; the answer is last even
though its gaps are the biggest, for the same reason.

**How many are held in six seconds of playback, every part switched on** — the
UI battery, one seed each:

| synthwave | dkc | bladerunner | lofi | plastikman | dungeon synth | jungle | acid |
|---|---|---|---|---|---|---|---|
| 55 | 27 | 14 | 10 | 4 | 2 | 1 | **0** |

**Acid's zero is not a fault and is the interesting one.** 1450 of its 1451
bass notes carry a hold — the densest part in the program — and none of them is
in the first six seconds, because the bass has not come in yet. A control that
does something real can still do nothing at the moment you happen to look, and a
check that measured only acid would have called this switch broken.
