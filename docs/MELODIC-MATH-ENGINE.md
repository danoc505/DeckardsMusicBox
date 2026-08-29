# THE MELODIC MATH ENGINE — the plan

*Designed 2026-08-29 from the eight annotated piano-roll sheets, against the
research already collected in `docs/genre-research/melodic-math.md`. That sheet
is the reasoning; this file is the build.*

The sheets analyse three records — Europe *The Final Countdown* (melody), Deep
Purple *Smoke On The Water* (main riff), NTFO & Karmon *Nobody Else* (melody and
bassline) — and between them they describe a complete, writable notation for a
melody. The program has none of it. This is how it gets built.

---

## 1. THE NOTATION, READ OFF THE SHEETS

### 1a. A motif is a list of durations with movements between them

```
     8 ( E2 ) 4 ( N ) 3
     │   │     │       └── duration of the third note
     │   │     └────────── duration of the second note
     │   └──────────────── how far the pitch moves into the third note
     └──────────────────── duration of the first note
```

`duration ( movement ) duration ( movement ) duration …` — one movement fewer
than there are notes. Straight from the sheet: *"we can combine these 2 functions
to give a simple single line of 'code' to lock in the motif."*

### 1b. The duration unit is DECLARED, not assumed

The three sheets use three different units and each says which:

| sheet | key |
|---|---|
| *Smoke On The Water* | `1 = 16th, 2 = 8th, 4 = 1/4, 8 = 1/2` |
| *Nobody Else* — melody | `1 = 1/4 note, 4 = 1 bar` |
| *Nobody Else* — bassline | `1 = 16th note, 2 = 8th note` |

So a motif carries its unit. `A = 4+4` means eight sixteenths in one sheet and
two bars in another. **The engine stores spans in sixteenths and the unit is a
notation convenience only** — otherwise the same string means two things.

### 1c. Movement has two levels of constraint, and that distinction is the point

| written | means | who decides direction |
|---|---|---|
| `(ii)` | move by 2, **direction free** | the engine draws it |
| `(E2)` | elevate by 2 | the motif |
| `(F2)` | fall by 2 | the motif |
| `(N)` | no movement, repeat the pitch | the motif |

The sheet is explicit about the first row: *"Motif 'A' being 4+4 in terms of
Rhythm and has a Melodic Movement of 2. Becoming 4(ii)4. **The direction is up to
your own personal taste.**"* And about the second: *"the 'x' value in the melodic
movement can be replaced with 'E' for Elevate, or 'F' for fall to give a strong
sense of familiarity."*

**That is this program's third law written in someone else's handwriting.** A
roman numeral is a constraint — a magnitude with the direction left open. `E`/`F`
is a value. Both are legal and the genre chooses which it is declaring.

### 1d. WHAT THE NUMBER COUNTS — the sheets and their captions disagree

The *Smoke On The Water* caption says *"a melodic movement of 'x2' meaning it
moves by 2 **semitones** at a time."* The notes it points at are D3 → F3, which
is **three** semitones — and exactly **two steps** of G Phrygian (D, Eb, F). The
`C` motif's `x1` is G3 → G#3, one step of the same scale and also one semitone,
so it does not separate the two readings. *The Final Countdown*'s `A = 1(i)1(i)4`
is C#4 → B3 → C#4 in F# minor: one scale step each way, two semitones each way.

**Every diagram is consistent with scale steps; only the prose says semitones.**
This is not resolved by guessing. The motif declares its unit:

```
moveUnit: "step"      degrees of the current scale   (the default)
moveUnit: "semitone"  chromatic
```

A genre that wants chromatic movement says so. Nothing has to be assumed and
nothing silently means the wrong thing.

### 1e. Silence is a named motif with a length

```
S = 6        (Silence)
```

From *The Final Countdown*: *"the 'S' motif (which represents silence) keeps the
other motifs happening at the same time, in the song this gives the arrangement
room for the chords to play at the start of every bar, acting like a **Call &
Response**."*

An `S` motif is not a gap left over. It is six sixteenths of nothing, placed on
purpose, and the reason it exists is so something else can answer.

### 1f. The structural formula — upper case ON, lower case OFF

```
Nobody Else, bassline:   A+a+B / A+A+B / A+a+B / A+a+b
                         (A+A+B)*4 with variations
                         Upper case turned on, lower case turned off

Smoke On The Water:      A+B+A+C+A+B+A+c
```

Four statements of the same three slots. What changes between them is **which
slots sound**. In the roll the lower-case slots are drawn as empty outlines: the
notes are written and not sounding. *"The 'B' rotates from being active and
inactive to give rest."*

### 1g. Balance, and deliberate imbalance

```
Nobody Else:      A = 4+3+1+4 = 12,  B = 4,  A+B = 16  (factors into 4/4)  BALANCE!
Smoke On The Water:  A = 4+4 = 8,  B = 6,  C = 2+8 = 10,  A+B+A+C = 32
```

The formula's total span must land on a whole number of bars. And then, once:

> *"Note in the 3rd 'A' a note is missed to create unbalance and create
> additional tension."*

One note removed from one statement. Not a transformation — a hole.

### 1h. Rhythmic acceleration — a subdivision inside the same span

```
A  = 1(i)1(i)4          A2 = 1(i)1(i)2(i)2
B  = 4(N)               B2 = 2(i)2
```

*"'A2' has the last note split into 2, still taking up the same amount of space,
but allowing for an extra key change."*

The span is the invariant, not each duration. A note may be split within its own
span, and the point of splitting it is that the new note carries a new movement.

### 1i. The last statement turns to close

> *"The 'A' motif elevates ('E') on the first 3, but on the 4th one it falls,
> giving variation and a sense of closure by ending where the melody starts on
> the key of D."*

`E, E, E, F` — a cadence written as a movement table. It is why the riff sounds
finished rather than merely stopped.

---

## 2. WHAT THE PROGRAM DOES TODAY, MEASURED

`materials.A.lead` is a flat array of `{bar, step, dur, pitch}`. There is no
motif, no name for a part of a phrase, no formula. Printed in the sheets' own
notation, lofi seed 1's tune is:

```
8(F5)4(F2)3(E2)4(E12)8(E2)4(F4)3(F1)4
```

The rhythm `8/4/3/4` does occur twice, so a motif is accidentally there — but
every movement differs and the second statement opens with a twelve-step leap.
Nothing declared it and nothing can name it.

**Measured over 40 seeds a genre, `materials.A.lead`:**

| | finding |
|---|---|
| movement magnitude | median **2**, and 69–81% of all movements are 1–2. This MATCHES the sheets and is not a gap. |
| no-movement (`N`) | **0% of ~2,680 movements.** The program never repeats a pitch, and `B = 4(N)` / `6(N)` — a whole motif on one note — is a device in two of the three sheets. |
| the phrase repeating itself | **157 of 199 records** have a lead whose second half is a bar-for-bar literal copy of its first: synthwave 40/40, dungeonsynth 39/40, fantasysynth 39/40, ds2 39/40. Only lofi varies (0/39). |

The last row is the whole problem in one number, and it is the owner's original
report — *"Right now those nine notes are on repeat."*

The three variation devices that exist — `Avar`, `Adev`, `Aseq` — are each a
**complete alternative note array** chosen per section. They vary the whole
phrase or nothing. None of them can express "play A, leave B out this time",
which is the primary device in all three sheets.

---

## 3. THE ENGINE

### 3a. The objects

```js
/* a motif: a rhythm, the movements between its notes, and its unit */
{ name: "A",
  rhythm: [1, 1, 4],              // sixteenths
  moves:  [{n:1}, {n:1}],         // magnitude only — direction is the engine's
  span:   6,                      // = sum(rhythm), the invariant
  moveUnit: "step" }              // or "semitone"

/* B = 4(N) — a movement of N is a declared repeat, not an absence */
{ name: "B", rhythm: [4], moves: [], span: 4 }

/* S = 6 — silence, with a length and a reason */
{ name: "S", rhythm: [6], silent: true, span: 6 }

/* a theme: the motifs, and the formula that orders them */
theme: {
  motifs: { A: "1(i)1(i)4", A2: "1(i)1(i)2(i)2", B: "4(N)", B2: "2(i)2", S: "6" },
  formula: ["A+S+B+S", "A2+S+B+S", "A+S+B+S", "A2+S+B2+s"],
  close:   "F",                   // the last statement turns to close
}
```

`A2` is not a separate motif. It is `A` with its last duration subdivided, and
the engine can derive it from `A` — but a genre may write it out, because
writing it out is how the sheets do it.

### 3b. The parser is the whole interface

```js
MM.parse("1(i)1(i)2(i)2")   ->  the motif object
MM.print(motif)             ->  "1(i)1(i)2(i)2"
```

Round-trip is the check: parse then print must give back the same string. That
is one line and it is the only test the notation needs.

Accepts both levels of constraint — `(i)`, `(ii)`, `(iii)` for a free-direction
magnitude; `(E2)`, `(F1)`, `(N)` for a fixed one. Prints back what it was given.

### 3c. Where it slots into the six stages

Stage 3 (MATERIALS) already owns "what the tune is". It keeps that job and gains
an internal structure:

```
STAGE 3, today          themeA(...)  ->  [ {bar,step,dur,pitch}, ... ]

STAGE 3, after          motifs      ->  statements  ->  [ {bar,step,dur,pitch}, ... ]
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^      ^^^^^^^^^^^^^^^^^^^^^^^^
                        the new part                    the SAME output
```

**The flat note array stays exactly what it is.** It becomes a *render* of the
motif list rather than the primary thing. Every stage downstream — the
arrangement, the performance, the voices, the export, the roll — is untouched,
because what it receives has not changed shape.

And the motif list is published beside it, so a section can ask *which motif is
this note in* — which is the question nothing downstream can currently ask.

### 3d. The hard laws — the engine refuses

These are definitional. Break one and the thing is no longer a motif.

1. **A motif's SPAN is invariant across every statement of it.** `A` is six
   sixteenths in statement one and six in statement four.
2. **A motif's attack points may not move** — except by declared subdivision,
   which splits a duration inside its own span and never crosses into the next.
3. **The formula's total span equals the phrase length.** Balance. A formula
   that does not land on a bar line is rejected at build, not corrected later.
4. **A slot that is off is silent for its whole span** — the phrase does not
   close up around it. That hole is the point.
5. **Silence is scheduled.** An `S` motif occupies its span; nothing may be
   placed in it.

### 3e. The soft laws — declared as constraints, drawn per statement

6. **Which slots sound**, per statement — the case pattern in the formula. A
   genre declares the rows; the seed picks which row this statement uses.
7. **Direction**, wherever the motif gave a magnitude only. Drawn, and bound by
   the close rule below.
8. **Which variant** — `A` or `A2` — where both are declared.
9. **The close**: the final statement's last movement turns against the
   prevailing direction. `E,E,E,F`.
10. **The imbalance**: one note dropped from one statement, once a phrase, when
    the genre declares an appetite for it.

### 3f. What this replaces

The rule of three (`materials.third`) stops being a separate mechanism. A
four-row formula whose rows differ **cannot** state the same thing three times
running — the law becomes a consequence of the structure rather than a patch
applied after it. That is the program's own "no correcting passes" rule finally
reaching the melody.

---

## 4. BUILD ORDER

Five phases. Each one ships ON, each one moves notes, and each one is read in
the roll and the printout before the next starts.

| # | what | proved by |
|---|---|---|
| **1** | `MM.parse` / `MM.print`, the motif object, the round-trip check. Nothing wired in. | the round-trip: parse→print is the input string, for every motif in the three sheets |
| **2** | Stage 3 publishes `materials.motifs` beside the note arrays — the CURRENT tune, segmented, not a new one. | the printout is byte-identical; this is the one legitimate use of that check, and it is one step, not a result |
| **3** | The formula drives which slots sound. On/off, per statement. | the roll: the phrase stops being a literal copy of itself. The 157-of-199 number must fall. |
| **4** | Movement: magnitude honoured, direction drawn, `N` legal, the close turns. | the printout: `\|mv\|=0` stops being 0%, and the last statement's last move opposes the others |
| **5** | Subdivision (`A2`), and the one-note imbalance. | the roll: same span, one more attack, one more pitch change |

Phase 3 is the one that answers the owner's original report. Phases 1 and 2 exist
so that phase 3 is a small change rather than a rewrite.

---

## 5. HOW IT IS PROVED

`node harness/mk2_roll.js` — the phrase repeating itself is a picture, and the
picture is what showed it. Print the roll before phase 3 and after; the literal
second-half copy is visible without counting anything.

`node harness/mk2_score.js` — the exact figures: the movement histogram, the
`N` count, the span of each motif in each statement.

And one measurement carries the whole build: **of 199 records, how many have a
lead whose second half is a literal copy of its first.** It is 157 today. A
phase that does not move it has not been applied.
