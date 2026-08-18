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

## 0b. TWO CORRECTIONS TO THIS SHEET, FROM THE SECOND SET OF DIAGRAMS

Written an hour after §1–§8 below, from three further analyses the owner
supplied (Europe, *The Final Countdown* — melody; Deep Purple again, as code).
**Both corrections are to claims I made too strongly.**

### 0b-i. A MOTIF COMPILES TO ONE LINE

> "So now we can combine these 2 functions to give a simple single line of
> 'code' to lock in the motif. Motif 'A' being 4+4 in terms of Rhythm and has a
> Melodic Movement of 2. Becoming **4(ii)4**. *The direction is up to your own
> personal taste.* Motif 'B' becomes **6(N)** to express the length of 6×16ths
> while having no movement. While motif 'C' becomes **2(i)8**."

So the notation is `duration ( movement ) duration ( movement ) duration …` —
numbers are durations in 16ths, the parenthesis carries the interval to the NEXT
note, `i` counts semitones, `N` is none. *The Final Countdown*'s whole melody is
five lines:

```
A  = 1(i)1(i)4        A2 = 1(i)1(i)2(i)2
B  = 4(N)             B2 = 2(i)2
S  = 6                (Silence)
```

This program has no such object. Its motifs are IMPLICIT — "bar 0 is A, bar 1 is
B" is a convention in the selection code, not a declaration with a rhythm and a
movement of its own.

### 0b-ii. SILENCE IS A NAMED MOTIF WITH A LENGTH

> "While the 'S' motif (which represents silence) keeps the other motifs
> happening at the same time, in the song this gives the arrangement room for
> **the chords to play at the start of every bar, acting like a Call &
> Response**."

`S = 6` — six sixteenths of nothing, scheduled, with a stated purpose. §3's
lower-case device MUTES a slot; this SCHEDULES a rest as an element with a
length and a reason. They are not the same thing: a muted slot leaves a hole
where a note was, and an S motif is a hole the phrase was BUILT around, which is
what makes room for the answer.

### 0b-iii. AND THE RHYTHM MAY SUBDIVIDE — §1 BELOW IS TOO STRONG

> "'A2' has the last note **split into 2**, still taking up the same amount of
> space, but allowing for an extra key change, we can call this **rhythmic
> acceleration**. A subtle yet welcome variation. The 'B' motif can see doing
> the same thing at the end of the phrase."

`A = 1(i)1(i)4` becomes `A2 = 1(i)1(i)2(i)2` — the closing 4 becomes 2+2. The
TOTAL SPAN is identical; one note has become two, and the point of it is that
the extra note carries an extra pitch change.

**So the invariant is the motif's total SPAN and its attack points, not every
duration in it.** §1 says "every device that changes a duration is out of
scope" and that is wrong as written: a note may be subdivided WITHIN ITS OWN
SPAN, and doing so is a named, welcomed variation. What may not happen is the
motif changing length or its strong attacks moving.

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

## 9. WHAT THE TEN TRANSCRIPTS ADD — read in full, 2026-08-18

`001`–`009` on `main`, read end to end at the owner's instruction. Most of their
content is already in `LOOP_TO_SONG.md`; these are the things that are NOT, and
that bear on the motif.

**`003` (Zelda) is the chain, described bar by bar, and it is the best
statement of it anywhere in this repo:**

> "Each phrase takes the last piece of the melody and adds something to it or
> twists it in a new way, giving the melody a **step-by-step progression from
> each bar to the next**."

and its worked example is a list of single-step transformations, each applied to
the PREVIOUS bar: leap root→fifth · the same leap INVERTED upward with the gap
filled by a scale run · the same shape in the PARALLEL MINOR and in TRIPLETS
instead of 16ths · the same again with a TURN that **delays the resolution from
beat 1 to beat 2** ("every bar of the melody so far has resolved cleanly on beat
one — small melodic surprises like this are the kind of thing that separates
good melodies from legendary ones") · then the turn figure alone, direction
FLIPPED, dropped a step, with a repeated note added to turn a dotted-eighth
rhythm into the intro's gallop.

**And it puts a length on a sequence**, which the program had to guess at:

> "It moves down in sequence through the B♭ minor scale **for two bars, just
> enough time to set up an expectation**, and then sucker punches us with the
> sudden jump to C major."

Two statements of a sequence, then break it. `move: { dir: "NEEF" }` — rise,
rise, fall — is that shape, and this is its citation.

**`005` (the 2-Loop Rule) puts a period on the arrangement**, and the program
does not use it: *"the arrangement has to change **every two loops of the
chords**, because our ears naturally expect songs to change every two loops of
the main instruments."* Its four moves are the only ones it allows — add an
instrument, add expression, remove an instrument, reduce expression — and it
insists **every transition has two sides**: *"there's the exit point and then
there's the entry point... the drums cover the exit point but for this entry
point I'm going to add a couple effects."* This engine has no transition object
at all; `fillInto` is an entry with no exit.

**`002` (transitions) adds truncation as a structural device** — *"the very last
bar of the section is chopped off and we instead dive straight into this
transition"* — and names the three ingredients that make a passage read as
transit: no melody, no harmonic stability, odd phrasing (*"sections break into
4+1+3 and 5+2 bar chunks"*).

**`006` (the rule of three) is stricter than this repo has been quoting it.**
Not only "three times is too many": *"**using it more than two times is
overusing it**"* — the change is due ON the third, which is what
`(statement) % 3 === 2` does, so the implementation is right and the doc's
paraphrase was loose.

**`009` is where the owner's instruction comes from, in the source's own
words:** *"you could always peel it back and maybe even **take some parts of
your loop to make one section and then other parts of the loop to make a second
section**"* — which is exactly "the first 9 notes are the phrase, break it into
two parts".

**`008` and `001`** are covered by `LOOP_TO_SONG.md` §9 and §1; the one thing not
carried over is `008`'s habit of **disabling rather than deleting** so a mute
pattern travels with a duplicated section — the same idea as this sheet's
upper/lower case, arrived at from the arrangement side.

**`004` (drums)** is a rhythm primer; its one item not in the drum engine is the
observation that the SPINE and the WEAK-BEAT material should use different
instruments, with a mix of low and high frequency content on the weak beats.

---

## 10. IT IS MAX MARTIN'S TOOLBOX, AND IT IS NOT ONLY FOR THE MELODY

*Web research, 2026-08-18, at the owner's instruction: "do more research on the
web about Melodic Math. It applies to all instruments but the drums."*

**The name has a lineage.** "Melodic Math" is the shorthand pop-music researcher
Asaf Peres uses for **Max Martin's entire songwriting toolbox** — the method
behind a long run of Billboard #1s, taught commercially at `melodic-math.com`
and `top40theory.com`. The two commercial pages are promotional and disclose no
method; the working rules are in the secondary analyses, and they are these:

| rule | as stated |
|---|---|
| **THREE OR FOUR PARTS** | "Use only **3–4 melodic parts per song** and introduce **one part at a time**" — "there must be no new items coming in at the same time" |
| **MIRRORING** | "a line has to have a certain number of syllables and the next line has to be its **mirror image** — if you add one syllable or take it away, it's a completely different melody to Max" |
| **CONTRAST BY NOTE LENGTH AND PLACEMENT** | "vary **shorter and longer notes, on and off beat** between verse and chorus... if the verse is off beat you need to be less messy (**on beat**) right after" |
| **THE HIGH NOTE IS SAVED** | "he will frequently **save the highest note for the second half** of a section" |
| **TENSION–RELEASE INSIDE THE PHRASE** | "he will often design phrases that have an **internal tension-release scheme**" |
| **LEAST PARTS, MOST IMPACT** | "Max is famous for getting the most out of the **least amount of parts**" |

**MIRRORING IS §2'S BALANCE, STATED AS A LAW ABOUT LENGTHS.** "A+B = 16, factors
into 4/4" and "the next line has to be its mirror image" are the same rule from
two directions: the motifs' lengths are not free, they must answer each other.
Add or remove one and it is a different melody.

**THREE OR FOUR PARTS** is a number this genre can be measured against directly,
and it is a constraint on the MOTIF COUNT, not the instrument count.

### And the scope

> [owner] "It applies to all instruments but the drums."

The sources agree by example: **the very first diagram in this whole set is a
BASSLINE**, not a melody — *Nobody Else*, "The Bassline", `A+a+B / A+A+B /
A+a+B / A+a+b`. Nothing in §3's device is particular to the melody chair, and
the bassline literature says the same thing in its own dialect: *"write a single
groovy bar of syncopated bass, then repeat that exact bar rather than constantly
varying it — repeating gives the listener time to lock onto the groove"*, with
named variations that are all subtraction or subdivision — **the skip** ("drop
one offbeat entirely to create a hole"), **the held note**, **the 16th ghost**
[corpus:mind-flux, corpus:attackmagazine].

**Drums are excluded because a motif is a thing with pitches.** The drum engine
has its own grammar and its own sheet (`ABACAAD`, fills and empties,
`drum-sectional-arc.md`); it is not a melodic-math object and does not want to
be one.

### And the transformation vocabulary is confirmed from the literature

Independent of the diagrams, the symbolic-music-generation literature catalogues
motif variation as *"moving the pitch, **merging notes**, **splitting notes**,
decorating notes"*, and defines **acceleration** as *"speeding up the motif by
reducing note duration and inter-onset interval"* [corpus:arxiv-motif-transform].
**Splitting a note is a named operation**, which is §0b-iii's `A2` under another
name, and it is not this sheet's invention.

---

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
- Musician Wave, "Max Martin and his Melodic Math Formula" —
  https://www.musicianwave.com/max-martin-melodic-math-formula/
- Music Business Worldwide, "How Max Martin's songwriting techniques are used to
  write hit, after hit, after hit" —
  https://www.musicbusinessworldwide.com/how-max-martins-songwriting-techniques-are-used-to-write-hit-after-hit-after-hit/
- Mystic Alankar, "Melodic Math — Max Martin's Song Writing Formula" —
  https://mysticalankar.com/blogs/blog/melodic-math-max-martins-songwriting-formula
- melodic-math.com and top40theory.com/melodic-math-course — the commercial
  courses. Promotional only; no method disclosed. Recorded so the next reader
  does not spend the fetch.
- Mind Flux, "Sequencing for Groove: Crafting Compelling Tech House Basslines" —
  https://www.mind-flux.com/news-1/2024/2/22/sequencing-for-groove-crafting-compelling-tech-house-basslines
- Attack Magazine, "Sculpting Warehouse-Style Rolling Techno Basslines" —
  https://www.attackmagazine.com/technique/tutorials/warehouse-rolling-techno-bass/
- "Motifs, Phrases, and Beyond: The Modelling of Structure in Symbolic Music
  Generation", arXiv:2403.07995
- This repo, `main` branch, `06 melody engine.js` — the sentence form, from the
  project's own Melody_2 notes.
