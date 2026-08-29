# THE MELODIC MATH ENGINE — the plan

*Designed from the owner's eight annotated piano-roll sheets and from three
complete songs measured note by note — System of a Down "Chop Suey", The Mars
Volta "Televators", Pink Floyd "Shine On You Crazy Diamond" — reading the
**melody and the bass of each**. The research behind it is
`docs/genre-research/melodic-math.md`.*

**This is not a melody engine. It is a LINE engine.** The law below governs any
single line the program writes — the lead, the bass, the counter, the repeating
figure. The owner's own *Nobody Else* sheets analyse a bassline in exactly this
notation (`A = 1/1/1/1/2`, `B = 2/2`, formula `A+a+B / A+A+B / A+a+B / A+a+b`),
and the bass turns out to need it more than the melody does.

---

## 1. WHAT MELODIC MATH IS FOR

**It is the law that lets the melody generator be set free without it making
noise.**

That is the whole reason it exists. This program's fourth principle already
says it:

> *Music is novelty, constrained. Pure rule is a loop; pure dice is a shuffle.
> The music lives between, and the constraint is the generator.*

Melodic math is that constraint, written down. It says what a tune is made of —
lengths, and the movements between them — and it says the few things that must
be true for a line to be a tune rather than a wander. Everything else it leaves
open, on purpose, so that different music can come out of the same engine.

### And what it is NOT

Melodic math describes **one line's own construction** — whichever line that is.
It does not describe the song around that line.

| melodic math | NOT melodic math |
|---|---|
| a motif's lengths and movements | which section of the song it is in |
| a silence inside a motif, with a length | call and response between the voice and the chords |
| a motif restated and varied | a verse coming back longer the second time |
| the order motifs are played in, inside a phrase | the order of the sections |

The Europe sheet is precise about this and it is easy to read past: `S = 6` is
melodic math, because six sixteenths of rest is part of the motif. What the
arrangement then does with that hole — put chords in it, answer it with a guitar
— is the arrangement's business. A rule about one is not a rule about the other.

---

## 2. THE NOTATION

### 2a. A motif is lengths with movements between them

```
     8 ( E2 ) 4 ( N ) 3
     │   │     │       └── the third note's length
     │   │     └────────── the second note's length
     │   └──────────────── how far the pitch moves into the third note
     └──────────────────── the first note's length
```

One movement fewer than there are notes. From the sheet: *"we can combine these
2 functions to give a simple single line of 'code' to lock in the motif."*

### 2b. Movement is written at one of two strengths

| written | means | who picks the direction |
|---|---|---|
| `(ii)` | move by 2, **direction free** | the engine draws it |
| `(E2)` | up 2 | the motif |
| `(F2)` | down 2 | the motif |
| `(N)` | none — the pitch repeats | the motif |
| `+` or `/` | nothing declared — the sheets' rhythm-only form, `4+4`, `1/1/1/1/2` | the engine draws all of it |

**And a movement may come last, after the final note.** `B = 4(N)` and `B = 6(N)`
are both in the sheets — one note, then a movement with nothing after it. That
trailing movement is how the motif **hands over**: where the pitch goes as this
motif ends and the next thing begins. `N` there means it goes nowhere, which is
what makes Smoke On The Water's `B` sit still. It is kept separately from the
movements inside the motif, so `moves` stays one shorter than `rhythm`.

The sheet says this outright: *"Motif 'A' … has a Melodic Movement of 2.
Becoming 4(ii)4. **The direction is up to your own personal taste.**"*

A roman numeral is a constraint. An `E` or `F` is a value. **Both are legal and
the genre chooses which it is writing.** This is the program's third law inside
the notation itself.

### 2c. The units are declared, never assumed

The three sheets use three different length units and each states its own:
`1 = 16th` in one, `1 = 1/4 note` in another. So a motif carries its unit. The
engine stores every length in sixteenths; the unit is a convenience for writing.

The movement unit is declared the same way. The *Smoke On The Water* caption says
`x2` means *"2 semitones"* and points at D3 → F3, which is three semitones and
exactly two steps of G Phrygian. Every diagram in the sheets reads as scale
steps; only the prose says semitones. So the motif says which it means —
`moveUnit: "step"` or `"semitone"` — and nothing is guessed.

### 2d. Silence is a motif with a length

```
S = 6        (Silence)
```

Not a gap left over. A named element with a span, placed on purpose.

### 2e. Capital letters sound, small letters do not

```
A+a+B / A+A+B / A+a+B / A+a+b
A+B+A+C+A+B+A+c
```

Same slots every statement. What changes is which of them sound. In the roll the
lower-case ones are drawn as empty outlines — written, and not played.

---

## 3. THE LAW — five things, and the engine may not break them

These held in all three songs measured, and they are all that held.

**L1. The line is built of motifs.** It is not drawn note by note. A melody that
was never made of named cells cannot be varied, only replaced.

**L2. A motif comes back.** Something recurs, or there is no hook to recognise.

**L3. When it comes back, at least one declared thing is preserved** — the span,
the opening, the movements, or the attack pattern. Which one is the genre's
business. Preserving *nothing* is not a restatement, it is a new motif.

**L4. Something changes before the repeat limit.** How many identical statements
are allowed is a number the genre sets. That a change must come is the law.

**L5. Every movement is stated.** A magnitude at least, a direction if the motif
says so. No note is an independent draw. This is what makes it a line rather
than a walk.

That is the whole law. Note what is *not* in it: no length, no interval size, no
repeat count, no bar alignment, no rule about which thing gets preserved.

---

## 4. THE DIALS — the make-up, and it is different in every song

Everything the law leaves open is a dial. Measured across the three songs, the
same four rules produced three completely different constitutions:

| | Chop Suey | Televators | Shine On |
|---|---|---|---|
| notes in a motif | 2 or 8 | 2–5 | 1–3 |
| lengths used | mostly 2 and 4 | 2, 4, 6, 8, 12 | 12, 18, 20, 21 |
| motif span | 16, locked to the bar | 12–20, crosses bar lines | one *note* is 20 |
| where it starts | on the downbeat | @2, @6, @8, @12 — off it | @4, never on it |
| movements inside | `N`, `F1`, `E1`; `E5` and `F12` when it grows | 1 to 11 | 1–2 on top |
| silence | 12 of every 16 in the call motif | short, irregular | gaps of 29 to 76 |
| statements before a change | 3 | 2 | irregular, 3–6 bars apart |
| what the change keeps | the span and the opening | the head — and throws the span away | the lengths |
| how it changes | splits a note; alters the first movement | **swaps two lengths**; frees the tail | moves pitch only |

Two of these are worth reading twice, because they are the ones that prove the
law is not a style.

**Chop Suey's answer motif has no movement at all.** `2(N)2(N)2(N)2(N)2(N)2(N)2(N)2`
— eight attacks on one pitch, a whole bar of it. Three statements identical
(bars 33, 35, 37), then bar 39 alters the first two movements and nothing else.

**Televators swaps two lengths and keeps everything else.** Bar 42 is
`4(E3)2(N)4(F3)2(E5)4` and bar 45 is `2(E3)4(N)4(F3)2(E5)4`. Same span, same
movements, the first two lengths exchanged — so the attacks move and the shape
does not. Chop Suey never does this, and a rule that said "keep the attacks"
would forbid it.

And Televators states a phrase **twice** before moving on (bars 25–26, then
31–32 identical), where Chop Suey states three times. Both are music. The
repeat limit is a dial.

### And the same law, on the bass

The three basslines are as different from each other as the three melodies, and
different again from the melodies beside them.

| | Chop Suey bass | Televators bass | Shine On bass |
|---|---|---|---|
| the motif | `2(F1)2` then `2(F1)2(E1)2(F1)2(E1)2(F1)2(E1)2(F1)2` | a **3-bar** cell: `12` @4 · `12(F9)12` · `6(E2)6` @8 | a 3-note turn, `2(E2)2(F2)2`, between held notes of 18–20 |
| span | 16, two bars alternating | **48 — three bars** | the turn is 6; the held notes are 20 |
| movement | `F1` and `E1` only — a semitone trill | 2, 5, 9, 12 | 1–3 |
| variation | **none at all across 16 bars** | the make-up changes twice in one song | the turn's intervals change, the shape does not |

Three facts come out of this that the melody alone would never have shown.

**1. Two parts can carry the same motif and different movements.** Chop Suey's
bass plays the vocal's rhythm exactly — one bar of `2 . 2`, one bar of eight
eighths — and the movements are the opposite: the vocal is `2(N)×8`, all one
pitch; the bass is `2(F1)2(E1)2(F1)…`, a semitone trill. Same skeleton, opposite
motion. Whether two parts are handed the same motif is the arrangement's choice;
what each of them then does with it is this law's.

**2. The bass may be the thing that does NOT vary.** Chop Suey's bass states
A+B eight times over sixteen bars without one change, while the vocal changes on
the fourth. L4 is per line, not per record — one line can be the anchor and
another the thing that moves.

**3. A line's make-up can change inside a song.** Televators' bass has three
constitutions: a three-bar riff (bars 41–49), then a pedal of one note every
three bars (53–74), then a dense line of three to six notes a bar with leaps of
up to twelve (77–86). One part, one song, three make-ups.

### The dials, listed

Span · notes per motif · which lengths exist · which movements exist ·
movement unit · how much silence and where · alignment to the bar ·
statements before a change · which of L3's four things is preserved ·
which change is used (subdivide, swap, alter the head, free the tail) ·
the interval between restatements · **whether this line borrows another line's
rhythm** · **how often the make-up is redrawn — once a record, or once a
section**.

---

## 5. WHERE THE MAKE-UP COMES FROM — ranges, drawn per record

**A genre must not declare the dials as numbers.** Writing `span: 16,
repeatLimit: 3, moves: [1,2]` into lofi is putting Chop Suey in a table and
calling it a genre.

A genre declares **ranges**. The seed draws a make-up inside them, once per
record, and freezes it as a stage-1 fact like everything else.

Declared per line, because a bass is not a lead:

```js
line: {          // one of these per role — lead, bass, counter, ostinato
  motifSpan:    [8, 32],          // sixteenths
  notesPer:     [2, 8],
  lengthPool:   [1, 2, 4, 8],     // which lengths this genre may use
  movePool:     [0, 1, 2, 3, 5],  // 0 means N is reachable
  moveUnit:     "step",
  silenceShare: [0.0, 0.75],
  alignToBar:   [true, false],
  repeatLimit:  [2, 4],
  preserve:     ["span", "head", "moves", "attacks"],   // L3: draw which one
  change:       ["subdivide", "swap", "alterHead", "freeTail"],
  rhythmOf:     null,             // or "lead" — borrow that line's rhythm,
                                  // keep your own movements
  redraw:       ["record", "section"],   // when the make-up is drawn again
}
```

So one lofi record comes out of short cells with three-quarters silence, and the
next out of long held notes with wide gaps, and both are lofi because the ranges
were lofi's. **The make-up emerges per record; the law never moves.**

This is the same law one level up: the genre says how far, the seed says which
way.

---

## 6. WHAT THE PROGRAM DOES TODAY, MEASURED

`materials.A.lead` is a flat array of notes. There is no motif, no name for part
of a phrase, no formula. Printed in the sheets' notation, lofi seed 1's tune is:

```
8(F5)4(F2)3(E2)4(E12)8(E2)4(F4)3(F1)4
```

**Measured over 40 seeds a genre:**

| | |
|---|---|
| movement size | median 2, and 69–81% are 1–2 — inside what the songs do, and not the gap |
| no movement | **0% of ~2,680 movements.** `N` is unreachable, and a motif on one repeated pitch is the loudest thing in Chop Suey |
| the phrase repeating | **157 of 199 records** have a lead whose second half is a bar-for-bar copy of its first — synthwave 40/40, dungeonsynth 39/40, fantasysynth 39/40, ds2 39/40, lofi 0/39 |

That last row is both failure modes at once, and it is exactly what having no
law looks like: **lofi wanders** — 0 of 39 repeat, a note-by-note random walk,
pure dice. **The other four copy** — pure rule. Nothing sits in between because
there is no constraint holding the middle open.

The three devices that exist — `Avar`, `Adev`, `Aseq` — are each a complete
alternative note array chosen per section. They vary the whole phrase or none of
it. None can say "play A, leave B out this time".

### And the bass is broken a different way

Measured the same, 40 seeds a genre, `materials.A.bass`:

| | |
|---|---|
| copying itself | **69 of 199** records have a bass whose second half duplicates its first — dungeonsynth and fantasysynth 25 of 40 each, ds2 19, lofi and synthwave 0 |
| no movement | **15% to 43%**, by genre. Reachable, and used. Not a gap |
| movement character | already genre-shaped and worth keeping: synthwave 43% `N` and 36% at twelve or more — root and octave; dungeon synth and fantasy synth 63% at 5–7 — root and fifth; lofi and ds2 mostly steps |

**But the bass has no motif at all, and that is the real defect.** Its rhythm
comes from `pocket`, a weighted table of sixteenth positions drawn independently
every bar. Five lofi seeds, twenty bars:

```
seed 1  [0/8 10/2] [0/8 10/2 14/2] [0/8 10/2 14/2] [0/8 10/2 14/2]
seed 5  [0/7 7/2 10/2] [0/7 7/2 10/2] [0/7 7/2 10/2] [0/7 7/2 10/2 14/2]
```

Every onset in every bar of every seed lands on one of four positions — 0, 7,
10, 14 — and each bar is that pocket minus a note or two, redrawn. There is no
`A`, no `B`, no restatement and no formula. It is not a bassline that repeats
too much; it is a bassline that was never made of anything.

So the two parts fail in opposite directions and need the same law:

- **the lead** has an accidental rhythm and wandering pitch
- **the bass** has a fixed rhythm pool and no cell above the bar

---

## 7. WHERE IT GOES

Stage 3 already owns what the tune is. It keeps that job and gains an inside:

```
today      themeA(...)  ->  [ {bar,step,dur,pitch}, ... ]

after      motifs  ->  statements  ->  [ {bar,step,dur,pitch}, ... ]
           ^^^^^^^^^^^^^^^^^^^^^^      ^^^^^^^^^^^^^^^^^^^^^^^^^^
           the new part                the SAME output
```

The flat note array stays exactly what it is — it becomes a *render* of the
motif list. Every stage downstream is untouched, because what it receives has
not changed shape. The motif list is published beside it, so a section can ask
*which motif is this note in*, which is the question nothing can currently ask.

The rule of three stops being a separate mechanism. It is L4, and its number is
a dial.

---

## 8. BUILD ORDER

| # | what | proved by |
|---|---|---|
| **1** | The notation: parse and print, the motif object, `N` and roman numerals both legal. Nothing wired in. **DONE** — `MM` in the program, `node harness/mk2_mm.js`. | round-trip — 31 motifs from the sheets and the three songs, every one comes back the string it went in as |
| **2** | Stage 3 publishes `materials.motifs` beside the notes — the CURRENT tune, segmented. | the printout is byte-identical. The one legitimate use of that check, and it is a step, not a result |
| **3** | The law: L1–L5 enforced on the LEAD, with the dials drawn from genre ranges. | the roll — the phrase stops copying itself. **157 of 199 must fall.** |
| **4** | The same law on the BASS: `pocket` becomes the pool a motif is built from, not the thing drawn every bar. | the roll — the bass grows an `A` and a `B`. **69 of 199 must fall, and the four-position rhythm must break.** |
| **5** | The change vocabulary: subdivide, swap, alter the head, free the tail — genre draws which. Plus `rhythmOf`, so a line may borrow another's rhythm and keep its own movements. | the printout — two records of the same genre come out with different make-ups |
| **6** | Movement: `N` reachable on the lead, magnitudes honoured, direction drawn where the motif left it free. | the printout — the lead's no-movement stops being 0% |

Phases 3 and 4 answer the owner's report on each part. Phases 1 and 2 exist so
that both are small changes rather than rewrites. The counter and the repeating
figure come last and for free — they are lines, and the law is per line.

---

## 9. HOW IT IS PROVED

`node harness/mk2_roll.js` — a phrase copying itself is a picture, and the
picture is what showed it. Print before and after; read it.

`node harness/mk2_score.js` — the figures: the movement histogram, the `N`
count, each motif's span in each statement.

And two numbers carry the build:

- **Of 199 records, how many have a line whose second half copies its first.**
  The lead is 157, the bass 69. A phase that does not move its number has not
  been applied.
- **How many onset positions the bass uses across a record.** It is four. A
  bass built of motifs cannot still be four.
- **How different two records of the same genre are from each other.** If every
  lofi record comes out with the same make-up, the dials were written as values
  and the whole point has been missed.
