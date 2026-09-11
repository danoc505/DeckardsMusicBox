# The blocks: every way a record interrupts itself with NOTES

*What this settles: what the pool of "special things that break the order" actually
contains, grouped by the SHAPE of the interruption rather than by which instrument
plays it — and which four of them this program already built off an offhand list
rather than off research.*

`THE-ALTERATIONS.md` is the catalogue for the MIX: sixty-five ways to restate a
section without touching a pitch. This is its twin for what is PLAYED. The two
are the same idea at different layers and neither is the other.

---

## 0. Why this document exists, and what went wrong without it

The owner described the concept three times and asked each time whether it had
landed:

> "We have basic rules for music to be generated algorithmically correct? Well
> music is not made like that normally, you need EMERGENCE of things to happen.
> So we need pools of special things that break the order of things."

> "Tom rolls and snare rolls FOR EXAMPLE are parts to be added to all genres.
> They are just parts of a song that can happen."

> "Its like legos we need to create options for the song to take and slot in
> correctly."

What was built instead was a literal transcription of the examples: a tom roll,
a snare build, a stop, a bar of double time (`src/stage/material/event.ts`).
Four things, none researched, chosen because they were the four named in
conversation. **"For example" was read as a specification.** §5 says which of
the four survive contact with the sources.

---

## 1. The shapes, which are the thing the examples were examples OF

The taxonomy is not this program's invention and it is not by instrument. The
drum literature already groups fills by FUNCTION, and the grouping generalises
to every part:

> "All drum fills can be grouped into three types: **variation, tension, and
> notification**. The function of a variation drum fill is to spice up a
> section, for example halfway through a 16-bar verse."
> — hackmusictheory.com, "3 Types of Drum Fills"

Those three are shapes, and a shape is what slots in. A tom roll and a keyboard
run are the same NOTIFICATION on different instruments; a snare crescendo and a
tremolo are the same TENSION. Three more shapes are needed that the fill
taxonomy does not reach, because they are made of absence rather than of notes:

| | the shape | what it does to the ear |
|---|---|---|
| 1 | **NOTIFY** | something is about to change — the boundary is announced |
| 2 | **TENSE** | pressure accumulates toward a point |
| 3 | **VARY** | the section is spiced without anything structural being said |
| 4 | **SUBTRACT** | the event IS the silence |
| 5 | **SPOTLIGHT** | everything stands back and one part is alone |
| 6 | **LURCH** | the FEEL changes while the notes stay |

A block is one of these six, played by whoever is available. That is the lego.

---

## 2. Length and rarity, which the program had wrong

> "Most drum fills last **1 to 4 beats**, commonly occupying the **last beat of a
> 4- or 8-bar phrase**."
> — rhythmnotes.net / blog.landr.com, drum fills

This is the single most useful number found and the program contradicts it.
`event.ts`'s `tomroll` **replaces a whole bar** — four times the upper bound,
sixteen times the common case. A fill that long is not a fill, it is a section.

And for the genres this record is being pushed toward:

> "sparse fills feel enormous at slow tempos"
> — riffhard.com, how-to-write-doom-metal-riffs

So in doom and sludge a block should be RARER and SHORTER than the pop default,
not equal to it. `REACHES = 0.28` is [chosen] and un-eared; this is a reason to
suspect it is high rather than low.

---

## 3. The catalogue

● built here and honoured   ◐ partly   ○ not built

### Layer 1 — NOTIFY

| | block | in notes | socket | length |
|---|---|---|---|---|
| 1 | ◐ **fill** | the last beat of the phrase is given to one part, played denser than the figure | the bar before a section seam | **1–4 beats** |
| 2 | ○ **pickup / anacrusis** | one to three notes ahead of the downbeat, leading into it | into any seam | < 1 bar |
| 3 | ○ **crash on the one** | a single ringing cymbal on the downbeat of a new section | the first beat after a seam | 1 hit |
| 4 | ○ **turnaround** | the last bar of a loop leads back to its own first chord instead of sitting | the seam of a repeat | 1 bar |
| 5 | ○ **anti-fill** | the last beat is EMPTIED instead of filled | as the fill, in its place | 1–4 beats |

Row 5 is the one an algorithm never reaches for and arrangers name outright: the
gap before the downbeat does the same job as the flurry.

### Layer 2 — TENSE

| | block | in notes | socket | length |
|---|---|---|---|---|
| 6 | ● **roll / crescendo build** | strikes accelerate and get louder toward the seam | into a seam, section going up | 1–2 bars |
| 7 | ○ **rhythmic augmentation build** | the figure's note values HALVE each pass — quarters, eighths, sixteenths | approaching a peak | 2–4 bars |
| 8 | ○ **tremolo** | one pitch repeated as fast as the grid allows | black metal; under a held layer | 1–4 bars |
| 9 | ○ **pedal build** | everything moves while one part holds one pitch under it | before a release | 2–8 bars |
| 10 | ○ **stacked entries** | one more part enters per bar rather than per section | a run-up | 2–4 bars |

### Layer 3 — VARY

| | block | in notes | socket | length |
|---|---|---|---|---|
| 11 | ○ **mid-phrase fill** | the variation fill — halfway through a long section, signalling nothing | mid-section, not a seam | 1–2 beats |
| 12 | ○ **added accent** | one hit of the figure is leant on that was not before | anywhere, on a repeat | 1 hit |
| 13 | ○ **dropped hit** | one hit of the figure is missing this pass | anywhere, on a repeat | 1 hit |
| 14 | ○ **pickup note added** | a grace note appears before a figure's strong note | on a repeat | 1 note |

**Rows 12–14 are the doom and sludge vocabulary and the program does not have
them.** This is the finding that most contradicts what was built:

> "Favor cyclical, mantra-like repetition with **subtle variation (rests, pickup
> notes, accents)**, and employ long sustains, bends, and vibrato to make simple
> figures feel monumental."
> — riffhard.com, how-to-write-doom-metal-riffs

The genre's own variation vocabulary is **a rest, a pickup note, an accent**.
The program's is inversion, retrograde, sequence and octave transposition —
a classical/jazz motivic set, applied to music whose sources describe none of it.

### Layer 4 — SUBTRACT

| | block | in notes | socket | length |
|---|---|---|---|---|
| 15 | ◐ **the cut** | everything stops on a beat; the bar finishes empty | mid-section, dense record | ½–1 bar |
| 16 | ○ **caesura** | a break in playing before the next entry — "the conductor decides when to bring the ensemble back in" | any seam | unmetered |
| 17 | ○ **the empty bar** | one whole bar of nothing where the figure would be | a repeat, mid-section | 1 bar |

> "A caesura marking indicates a break or stop in playing, and the conductor
> decides when to bring the ensemble back in." — LANDR, music symbols

### Layer 5 — SPOTLIGHT

| | block | in notes | socket | length |
|---|---|---|---|---|
| 18 | ○ **tacet** | the whole band stops; ONE part continues | mid-section, after two hearings | 1–2 bars |
| 19 | ○ **stop-time** | the band hits beat one of each (or every other) bar and rests; one part plays through the gaps | under a feature | 2–8 bars |
| 20 | ○ **the break** | everything but the rhythm section stops | after a peak, or before one | 1–4 bars |

> "Tacet … refers to a point where everyone except the voice is silent for a
> moment — a common device in jazz where **the whole band stops for a bar or two
> leaving a single instrument to continue**." — rec.music.theory

> "Stop-time is an accompaniment pattern **interrupting or stopping the normal
> time**, featuring regular accented attacks on the first beat of each or every
> other measure, **alternating with silence or instrumental solos**."
> — en.wikipedia.org/wiki/Stop-time

**This layer is the "bass solo" and "drum break" the owner asked for, and they
are named devices with definitions rather than inventions.** They are marked
`needs-arrangement`: they change WHO is playing, which is `arrange.ts`'s to
decide, not the material stage's.

### Layer 6 — LURCH

| | block | in notes | socket | length |
|---|---|---|---|---|
| 21 | ● **double time** | the figure at half the spacing, same pitches | a record already at its top | 1–2 bars |
| 22 | ○ **half time** | the figure at twice the spacing — doom's own move | to thicken, anywhere | 2–8 bars |
| 23 | ○ **the lurch** | the feel changes between trudge and drive without the tempo changing | sludge, at a seam | a section |

> "Use **half-time feels to thicken grooves** … drums that **lurch between
> trudging slow-motion grooves and ragged mid-tempo blasts**."
> — riffhard.com, how-to-play-sludge-metal

Half time is the doom move and the program has only its opposite.

---

## 4. The drone, and a knob that does nothing

The program restricted the drone's third-statement alteration to `thin` and
`augment`, reasoning from a collision bug that only subtraction is safe on a
held tone. **Measured: 0 of 872 drone rounds are altered.** `varyLine` refuses
to thin a line of one or two notes, and `augment` thins first. The rule fires
never. This repo calls that its cardinal sin and it shipped.

The reasoning was also never researched. The program's own cited source for
`drone.tone` says:

> "A drone effect can be achieved through a sustained sound **or through
> repetition of a note**."
> "The drone is most often placed upon **the tonic or dominant**."
> "a note or chord is continuously sounded throughout **most or all** of a piece."
> — chromatone.center/theory/melody/drone

Three alterations follow, and none of them moves the pitch off its law:

| | block | in notes |
|---|---|---|
| 24 | ○ **re-articulate** | a held tone becomes the same pitch struck repeatedly, or repeats merge into one hold — the source names BOTH as drone |
| 25 | ○ **shift the string** | tonic ↔ fifth — both are named, so moving between them stays lawful |
| 26 | ○ **the floor goes out** | the drone drops for one turn — "most or all" is not "all" |

The general research agrees the pitch itself should not wander:

> "Unlike melody, which moves through different pitches, a drone maintains one
> or more constant frequencies … music based on drones can consist of pure
> drones, **slowly changing drones**, or drones augmented with transient sounds."
> — perfectcircuit.com / britannica.com, drone music

So the constraint was right and the operations were wrong.

---

## 5. The four that were built, judged

| | verdict |
|---|---|
| `tomroll` | **Shape sound, length wrong.** A fill is 1–4 beats, commonly the last beat; this takes the whole bar. Rebuild at the researched length. |
| `snarebuild` | **Sound.** Row 6, a tension block, correct shape and plausible length. |
| `stop` | **Not a device as built.** It deletes the back half of a bar, which matches no named gesture. The real ones are the caesura (16), the empty bar (17) and stop-time (19), and stop-time — hits on one, silence between, under a feature — is the one worth having. |
| `double` | **Sound, and half a pair.** Row 21. Its partner, HALF time, is the move doom actually uses and is missing. |

Two of four survive. One has the wrong length. One is not a thing.

---

## 6. Build order

1. **The drone's three (24–26).** It is the shipped dead knob, and all three are
   cheap: none needs a new mechanism, only operations that fit a held tone.
2. **The doom vocabulary (12–14): accent, dropped hit, pickup note.** The
   sources name these as the genre's own variation, and the program's motivic
   set contains none of them. This is also what the "ornamentation — the program
   cannot ADD a note" gap really is.
3. **Fix `tomroll` to 1–4 beats, and add the anti-fill (5).** Both are edits to
   a file that exists.
4. **Half time (22).** The missing half of a pair already built.
5. **The SPOTLIGHT layer (18–20).** The bass solo and the drum break, properly
   named. These need `arrange.ts`, because they change who is playing — the one
   group here that is not the material stage's to do alone.

Everything above row 18 rewrites bars a part already owns and needs nothing new
from the program.

---

## Sources

- hackmusictheory.com, "3 Types of Drum Fills" — the variation/tension/notification taxonomy
- rhythmnotes.net, "How to Play the Best Drum Fills"; blog.landr.com, "Drum Fills" — fill length and placement
- en.wikipedia.org/wiki/Linear_drumming — linear fills
- en.wikipedia.org/wiki/Stop-time — stop-time's definition
- rec.music.theory, "is tacet the right word for this?" — tacet as a band-stops device
- blog.landr.com, "60 Music Symbols and Their Meanings" — caesura
- riffhard.com, "How to Write Doom Metal Riffs" and "How to Play Sludge Metal" — repetition with subtle variation; half-time; sparse fills at slow tempo; the lurch
- chromatone.center/theory/melody/drone — the drone's own cited source, read properly this time
- perfectcircuit.com, "The Long Hum: Drone Music Explained"; britannica.com, "Drone music" — pure, slowly changing, and augmented drones
