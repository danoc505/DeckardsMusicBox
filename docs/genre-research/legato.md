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

---

## 7. THE GENRE'S OWN LEGATO — added 2026-08-08, on the user's direction

*"Naturally some songs should already be using legato but we dont have it"* was
half of the original request, and the switch alone did not answer it: a hand
control that no genre reaches leaves every genre exactly as unslurred as
before. The user, closing the gap: "we have a bunch of new controls wouldnt it
make sense that genres get access to this in order to effect change over the
sections and the whole of the song?"

### The sources for WHERE

> "**Mono legato mode is frequently used on synth basslines and synth leads**,
> especially in solo sections of a song."
> [[Attack Magazine, *Legato Synths: Glide, Slide & Portamento*](https://www.attackmagazine.com/technique/passing-notes/legato-synths-glide-slide-portamento/)]

> The Blade Runner lead is "two detuned sawtooths ... shaped by an envelope
> with **slow attack and long release**", played for its aftertouch and its held
> expression.
> [[Reverb Machine, *Vangelis' Blade Runner Synth Sounds*](https://reverbmachine.com/blog/vangelis-blade-runner-synth-sounds/)]

A slow-attack patch played detached never finishes opening — the note IS the
hold. That is the argument for bladerunner specifically, and it is a physical
one rather than a taste one.

### What is declared, and what deliberately is not

| genre | declares | why |
|---|---|---|
| **bladerunner** | `lead`, `counter` | the Vangelis patch above; the answer is the same player's other hand |
| **synthwave** | `lead` | Attack Magazine's sentence, verbatim |
| synthwave bass | — | its bass is a PULSE by its own research; holding it deletes the pulse |
| everything else | — | no source in hand. The door is open; walking through it is an ears question per genre |

### The three-way rule

The genre's declaration is read at DISPATCH beside the hand's button, and the
hand outranks the table in both directions — the L button cycles **follow the
genre → forced ON → forced OFF**. This is the tape POWER's rule worn as one
key, and it exists for the same sentence: "If I turn a knob it should always
work for me no matter what the genre is."

Composed notes do not change — the snapshot is byte-identical, and the A/B
render is the instrument that can see the difference (bladerunner and
synthwave move; the six undeclared genres must not).

### Per-SECTION legato — asked for, not yet built

The user: legato "can be on on certain sections or for the whole song. Right?"
Today: the genre's declaration is whole-song, and the hand can ride the button
live while it plays — which covers sections by a human. A genre varying it BY
SECTION needs the declaration to reach dispatch with a time span attached, the
way the motion system already reaches bus controls per section. Named in
BACKLOG §5.1 rather than half-built here.

### The A/B numbers — and one more probe that measured its own setup

Rendered audio, this build against the one before the genre door existed:

| song | rms of the difference | verdict |
|---|---|---|
| bladerunner seed 1 | **−26.2 dB, 48.2% of samples moved** | the held lines are audibly in the record |
| lofi seed 1 (declares nothing) | **−111.2 dB, 0 samples** | an undeclared genre is untouched |

**The first run of this A/B read INAUDIBLE on bladerunner and it was the
probe's window, not the wiring** — seed 5's first held-able note lands at
30.9 seconds and the probe compares the record's opening seconds. The §6
lesson ("a control that does something real can still do nothing at the moment
you happen to look") caught on the very next build, so the sequence is now
part of the method: COUNT when the declared parts first hold (seed 1: 1.8 s),
then point the A/B there.
