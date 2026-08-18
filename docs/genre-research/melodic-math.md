# MELODIC MATH — the phrase is two motifs, and the variation is which one sounds

*Researched 2026-08-18, from five annotated piano-roll analyses supplied by the
owner (NTFO & Karmon "Nobody Else" — bassline and melody; Deep Purple "Smoke On
The Water" — main riff), cross-checked against motivic-development literature.*

> [owner] "The phrase is what is being altered and there are certain kinds of
> alterations one can do based on the melodic maths. On the lead track of seed
> one, the first 9 notes it plays that is the phrase. It could be broken into
> two parts and those parts can be manipulated in ways that keep their memory to
> the listening. Right now those nine notes are on repeat."

---

## 0. WHAT THE PROGRAM DOES TODAY, AND WHY IT IS NOT THIS

Seed 1's tune, printed:

```
G#4 B4 C#5 E5 A#4 | B4 C#5 E5 A#4        and bars 3-4 are an exact copy
```

Nine notes. They play, whole, every 13 seconds, for twenty minutes. The engine's
two change devices — the rule of three (`materials.third`) and the evolution
chain (`materials.evo`) — both operate on the WHOLE PHRASE and both change
PITCHES. Neither can express "play the first half and leave out the second",
which is the primary device in every one of the five analyses.

**The rule of three, as built, is a crude shadow of this sheet.** It says
"something must change by the third hearing" and then changes the phrase's tail.
The sources say something much more specific: the phrase is TWO NAMED MOTIFS,
and what changes between hearings is WHICH OF THEM SOUNDS and AT WHAT PITCH —
never their rhythm.

---

## 1. THE RHYTHM IS THE INVARIANT

> "The 'A' and 'B' motifs **always stay in the same rhythm**, thus giving them a
> strong hook and quickly establishes into your mind and making it memorable. It
> is kept interesting by changing the ORDER the 'A' & 'B' is played and by
> changing KEY." — *Nobody Else*, bassline

> "The A & B always have the **same Rhythmic structure**: A=(4+3+1+4) & B=(4),
> but change their key and contour to stay interesting." — *Nobody Else*, melody

This is the load-bearing claim and it is the opposite of how this program varies
things. A motif is recognised by its RHYTHM; its pitches are free.

Confirmed in the literature: *"A great approach is keeping the rhythmic
structure of a motif in place but playing with pitch to carry the melody
forward"*; **tonal displacement** is *"moving your motif to different notes
within the appropriate scale while RETAINING THE RHYTHM AND CONTOUR"*
[corpus:soundfly-flypaper]. A motive *"may be defined by pitch, contour, or
rhythm, so a transformation may keep one of these while changing another"*
[corpus:fiveable-ap].

---

## 2. RHYTHMIC MATH — the motifs' lengths must BALANCE

*Nobody Else*, melody:

```
A = 4+3+1+4  = 12
B = 4        =  4
A + B        = 16   (factors into 4/4)   BALANCE!
key: 1 = 1/4 note, 4 = 1 bar
```

*Smoke On The Water*, riff:

```
A = 4+4 = 8      B = 6      C = 2+8 = 10
A+B+A+C = 32
key: 1 = 16th, 2 = 8th, 4 = 1/4, 8 = 1/2
```

*Nobody Else*, bassline:

```
A = 1/1/1/1/2    (four 16ths and an 8th)
B = 2/2          (two 8ths)
```

So a motif is **a list of durations**, and the phrase is motifs concatenated to
a whole number of bars. The durations are the identity.

---

## 3. THE STRUCTURAL FORMULA — upper case ON, lower case OFF

*Nobody Else*, bassline. This is the single most important diagram:

```
Structural Formula:   A+a+B / A+A+B / A+a+B / A+a+b
                      (A+A+B)*4 with variations
                      Upper case turned ON, lower case turned OFF
```

The phrase is three slots. Every statement plays the same three slots in the
same rhythm; what changes is **which slots sound**. In the roll, the lowercase
slots are drawn as EMPTY OUTLINES — the notes are written and not sounding.

*Smoke On The Water* is the same device with a third motif:

```
Melodic Structure:  A+B+A+C+A+B+A+c
```

C appears once, and its second appearance is turned off.

> "The 'B' rotates from being **active and inactive** to give rest."
> — *Nobody Else*, melody

**This is the mechanism this program does not have.** `LOOP_TO_SONG.md` §1 said
"subtraction is the primary arrangement verb" and it was built at SECTION scale
(`form.rest`, which instrument sits out). The sources apply it at MOTIF scale,
inside the phrase, which is a different and much finer thing.

---

## 4. MELODIC MOVEMENT — a declared direction and a declared interval

*Smoke On The Water*:

```
E = Elevate     F = Fall     N = No Movement

"Each 'A' motif has a melodic movement of 'x2', meaning it moves by 2 semitones
 at a time. The 'B' motif doesn't have any movement — 'N'. The 'C' motif only
 happens once, but it has a movement of 'x1'.
 The 'A' motif elevates on the first 3, but ON THE 4TH ONE IT FALLS, giving
 variation and A SENSE OF CLOSURE by ending where the melody starts, on D."
```

Two things this program has no way to say:

1. A motif's pitch level moves by a **fixed interval**, the same every time —
   not a redrawn transposition. This is **sequence** proper: *"repeating a
   motive at different pitch levels"*, *"move your motif up or down to different
   pitch levels without disrupting the pattern"* [corpus:soundfly-flypaper].
   The engine's `sequence` device draws ±1 or ±2 scale steps at random each
   time, which is not a sequence — it is a wander.
2. The last occurrence **turns the other way to close**. E, E, E, F. That is a
   cadence expressed as a movement table, and it is why the riff sounds
   finished rather than merely stopped.

---

## 5. THE DELIBERATE IMBALANCE

> "Note in the 3rd 'A' **a note is missed** to create unbalance and create
> additional tension." — *Nobody Else*, melody

A single note removed from one occurrence — not a transformation of the phrase,
a hole in it. Related to **fragmentation**, *"breaking the motif into smaller,
independently developed pieces"* [corpus:vaia], but smaller: one note.

---

## 6. AND A+A+B IS THE CLASSICAL SENTENCE

`(A+A+B)*4` is the sentence: basic idea, repetition of the basic idea,
continuation. The repo already had this written down and did not connect it —
`06 melody engine.js` on `main`, from the project's own Melody_2 notes:
*"sentence = 2-bar idea, repeat, CONTINUATION (more motion) → cadence."*

---

## 7. THE VOCABULARY, CONSOLIDATED

Named in the supplied analyses, with the literature's terms beside them:

| the analyses call it | the literature calls it | what it does |
|---|---|---|
| lower case / turned off | (no standard name) | the slot is silent this time |
| changing the order of A & B | permutation of the structural formula | which motif plays when |
| E / F / N with an interval | **sequence**, **tonal displacement** | same rhythm, new pitch level |
| changing key & contour | **melodic variation** | same rhythm, redrawn shape |
| a note is missed | (fragmentation, at one note) | a hole for tension |
| same rhythmic structure | the invariant | what makes it a hook |

And from the literature, available and unused here: **inversion** (mirror the
pitches), **retrograde** (backwards), **augmentation** (longer durations),
**diminution** (shorter), **rhythmic variation** (change the rhythm, keep the
shape) [corpus:vaia, corpus:fiveable-ap].

---

## 8. WHAT THIS MEANS FOR THE ENGINE

1. **A theme must be built as a LIST OF MOTIFS, each with a fixed rhythm** —
   not as one flat note array. Today `themeA.notes` has no internal structure,
   so nothing downstream can name a part of it.
2. **A structural formula per statement**, cycling — `A+a+B / A+A+B / A+a+B /
   A+a+b`. This replaces the rule of three as the primary variation device; the
   rule of three becomes a consequence of the formula rather than a separate
   mechanism, because a formula whose four entries differ cannot repeat itself
   three times running.
3. **A movement table per motif** — `{ of: "A", by: 2, dir: "EEEF" }` — so a
   motif's sequence is a declared interval and the last one turns to close.
4. **The rhythm never changes.** Every device that changes a duration is out of
   scope for the motif; augmentation belongs to a different material (`C`
   already does it).

## Sources

- Five annotated piano-roll analyses supplied by the owner, 2026-08-18: NTFO &
  Karmon *Nobody Else* (bassline ×2, melody), Deep Purple *Smoke On The Water*
  (structure, movement).
- Vaia, "Motif Development: Techniques & Examples" —
  https://www.vaia.com/en-us/explanations/music/music-composition/motif-development/
- Soundfly/Flypaper, "7 Melody Writing and Motivic Development Techniques for
  Songwriters" — https://flypaper.soundfly.com/write/7-melody-writing-and-motivic-development-techniques-for-songwriters/
- Fiveable, AP Music Theory 6.5 "Motive and Motivic Transformation" —
  https://fiveable.me/ap-music-theory/unit-6/motive-motivic-pit-transformation/study-guide/z0DJQvgjoByphnhSnztH
- Wikipedia, "Melodic motion" — https://en.wikipedia.org/wiki/Melodic_motion
- This repo, `main` branch, `06 melody engine.js` — the sentence form, from the
  project's own Melody_2 notes.
