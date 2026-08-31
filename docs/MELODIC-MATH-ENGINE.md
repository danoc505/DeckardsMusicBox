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

*Built: each device declares what it keeps, and the engine holds it to that.
`displace` keeps the rhythm and moves the pitch; `swap` and `subdivide` keep the
SPAN and move the attacks. A law that said "keep the rhythm" would forbid two of
the three, and Televators would be illegal music.*

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
  restate:      [1, 2],           // how many IDENTICAL statements are allowed
  restateBy:    [-2, -1, 1, 2],   // the displacements this genre will accept
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
| no movement on the lead | 0% of ~2,680 movements — **and that is a fix working, not a gap.** The owner reported the lead repeating a pitch as a defect six times; `noRepeats` is the answer and is deliberately on. `N` is reachable elsewhere: the bass uses it 15–43% of the time. A genre may argue with it by declaring `noRepeat: false` |
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

### AND THE BASS IS MOSTLY NOT BROKEN — measured, and it was claimed otherwise

An earlier version of this sheet said the bass "was never made of anything",
from lofi's five seeds and a reading of the `pocket` loop. **Measured across all
five genres, that is wrong, and it is wrong in the way this program's third law
is about: one genre's numbers stated as the program's.**

Each genre's bass, material A, seed 1:

| genre | notes | steps it uses | what it is |
|---|---|---|---|
| lofi | 11 | 0, 10, 14 | the `pocket` loop |
| synthwave | 30 | 0,2,4,6,8,10,12,14 | a driving eighth-note line — **not the pocket loop** |
| dungeonsynth | 8 | 0 only, dur 16 | **a pedal**: one whole note a bar |
| fantasysynth | 8 | 0 only, dur 16 | a pedal |
| ds2 | 14 | 0,2,4,8,10,12 | **not the pocket loop** |

**Only lofi runs the `pocket` loop at all.** Two genres hold a pedal, which for
dungeon synth is right rather than broken, and two build their line another way
entirely.

And the bass already restates. Distinct bar rhythms per record, 40 seeds a
genre:

```
lofi 2.46   synthwave 2.33   dungeonsynth 1.23   fantasysynth 1.10   ds2 1.98
                            86% of all bars are a restatement of another bar
```

So **the 69 of 199 is not a defect count.** In dungeon synth and fantasy synth,
where 50 of those 69 sit, the bass is a pedal following a two-bar chord loop —
the halves match because the CHORDS do, which is the music working. The lead's
157 was a real defect; the bass's 69 is mostly a measurement of the chord
progression's period.

### AND THE PEDAL IS THE FAULT — ruled by the owner, then measured

> [owner:] *"the pedal bass is a defect of the genre. It doesnt work in any
> case."*

So the two genres holding one are wrong, and the numbers say how wrong. Twenty
records a genre, material A:

| | notes a bar | stepwise | distinct pitches | bars on one pitch |
|---|---|---|---|---|
| dungeonsynth, before | 1.46 | **0%** | 2.1 | 54% |
| fantasysynth, before | 1.43 | 6% | 1.9 | 58% |
| ds2 | 4.33 | 53% | 5.4 | 0% |

**The fix already existed in the file and was in the wrong place.** ds2 met this
same fault, was given a line, and is the best bass here — while the parent it
was forked from, and fantasy synth beside it, kept the pedal. A fix that lands
in a fork and not in the thing that was broken is a fix that was never made.

`bassStyle: "drone"` is one value where a pool belongs. Both genres now declare
a weighted style pool with no pedal in it, dungeon synth gains `bassTones`
carrying the `step` choice that was built and reachable by no genre, and ds2
declares its own pool so an inherited one cannot widen the genre that was
already right.

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
| **2** | Stage 3 publishes `materials.motifs` beside the notes — the CURRENT tune, segmented. **DONE** — `MM.readLine`, printed by `mk2_mm.js`. | the printout is byte-identical. The one legitimate use of that check, and it is a step, not a result |
| **3** | The law on the LEAD: the verbatim hook copy becomes a restatement governed by L3 and L4, displaced in scale steps, with `restate` drawn per record. **DONE.** | **157 of 199 copies → 88.** The rhythm survives every displacement it makes: 7 of 160 restatements in the hook genres lose it, down from 42 |
| **4** | **RE-AIMED AND DONE.** As first specified it was written against the `pocket` loop, which only lofi runs; built and measured it moved 1.81 distinct bar rhythms to 1.82 and was reverted. The real fault was the PEDAL — `bassStyle: "drone"`, ruled a defect by the owner — and it is now a style pool per genre. | dungeon synth 1.46 notes a bar and **0% stepwise** → 3.35 and 37%; fantasy synth 1.43 and 6% → 3.16 and 32%; bars holding one pitch 54% and 58% → 35% and 5%. ds2, which was already right, is unchanged at 4.33 and 53% |
| **5** | The change vocabulary — **displace, subdivide, swap**, weighted by the genre and searched. **DONE.** (`rhythmOf`, a line borrowing another's rhythm, is not built.) | of 199 records: 87 keep the exact hook, 65 displace, 37 change the span. Dungeon synth's ten first seeds use four different devices between them |
| **6** | **WITHDRAWN.** It said "make `N` reachable on the lead", justified by one song having a motif on a repeated pitch. The program's own record says the opposite: a repeating lead pitch is a defect the owner reported six times, `noRepeats` is the fix, and it is on by a default any genre may argue with. Building this would have undone it. What remains of the phase — magnitudes honoured and direction drawn where a motif leaves it free — is already how `displace` works. | — |

Phases 3 and 4 answer the owner's report on each part. Phases 1 and 2 exist so
that both are small changes rather than rewrites. The counter and the repeating
figure come last and for free — they are lines, and the law is per line.

---

## 8b. AND IT HAS TO SURVIVE THE WHOLE SONG

Everything above works inside one material. A material is four bars; a record
plays it ten or twelve times. **Measured, aligned to each section's start, the
lead only:**

```
  dungeon synth   material A   10 statements   10 distinct rhythms   0 repeats
  ds2             material A   10 statements   10 distinct           0
  synthwave       material A@1  7 statements    7 distinct           0
  fantasy synth   material A   12 statements   11 distinct           1
```

Not one statement of the hook came back the way it had been heard. The motif
existed in `materials.A` and was reshaped before it reached the ear, every time.

**The cause was one token.** `thin` gates notes by the arc, and its draw was
seeded on the RECORD's bar, so the same note of the same figure drew a fresh
coin at every statement. The drums had been fixed for exactly this — the file
records the owner on "a child smashing random drums with zero rhythm or reason"
and the groove being re-diced 470 times a record — and the fix stopped at the
kit, under a stated hypothesis: *"for a melody, losing a different note each
time round is variation."*

The measurement falsifies it. One note lost is variation; a different subset
every time is the thing that same note condemns. Every role thins on the
material's own bar now. The threshold still moves with the arc, so a part still
opens out across the record — it opens out by the SAME notes arriving in the
same order.

**The right measure is nesting, not distinctness** — a hook thinning to its
skeleton and building back gives *different* rhythms that are *nested* subsets,
where a re-roll gives arbitrary ones — **and it has to be taken per MATERIAL BAR,
not per statement.** `arcE` is a per-bar quantity, so within one four-bar
statement each bar has its own threshold; two statements can each be nested
bar-against-bar and still cross when compared as wholes. Measured per statement
the fix reads 43% → 55%, and that number is inflated by the arc doing its job.
Per material bar:

```
                   before   after
  synthwave          61%     66%   nested
  dungeonsynth       64%     69%
  ds2                64%     69%
  lofi               70%     70%
  fantasysynth       88%     92%
  TOTAL              74%     78%
```

**Four points, not twelve.** Real, and much smaller than the first reading of it.

**And the "22% arbitrary" closed, by reading the bars.** It was three things:

- **7 points were the probe's own bar-line bug** — a note struck exactly on the
  next bar's downbeat was counted into the previous bar, the same rounding fault
  `mk2_score.js` documents and fixes. With it fixed: 85% nested.
- **14 points are the tail-variant device, working.** The verse plays
  `A A | A A′ | A A′` — the first cycle whole, later cycles with the rule of
  three's varied tail — and the variant itself recurs exactly (dungeon synth
  seed 1: bars 10≡14, 11≡15). Counting each side against the record, both are
  established figures. That is a motif and its variant, not noise.
- **2% is real noise.** Per genre: 0–6%.

So the engine's output survives the perform stage: 98% of same-bar statement
pairs are either the figure or an established variant of it. The lesson is the
sheet's own warning applied to measurement — the statistic said "arbitrary" and
the bars said "the rule of three". Read the bars.

### And this is what the break needs

> [owner:] *"we have to be able to break the rules at times at certain points
> and to have that be something important in that song."*

A break is only an event if the rule was kept. While every statement of the
hook differed, nothing could be a departure from anything — there was no
established figure to depart from. Making the motif recur is what makes a
placed break possible, and the sheets already name the device: *"Note in the 3rd
'A' a note is missed to create unbalance and create additional tension."* The
break is built, and it needed that ground first.

### The movement table across statements

Read off seed 782's printout: the chorus phrase was heard sixteen times and all
sixteen began A#4 — displacement happened once, at build, and then the material
looped pitch-identical for the record. The sheets' per-statement device was
missing: *"elevates on the first 3, but on the 4th one it falls, ending where
the melody starts."*

Built in stage 5, where the material loops: each statement of a section carries
an offset in scale steps — `N` holds the base, `E` lifts by the drawn magnitude,
`F` falls.

**The shape is GENERATED, and the first version of it was not.** It shipped four
hand-written strings — `["NEEF","NNEF","NEFN","NENF"]` — as the default for
every genre, and `NEEF` is Smoke On The Water's own `E,E,E,F` with an `N` in
front; the other three were invented to make one riff's contour look like a
pool. No genre declares `theme.seq`, so every record in the file got that one
song's shape. A baked-in value in a constraint's clothes.

It comes from rules now, and the rules are theory rather than any song:

- **A sequence departs from something heard.** The first statement of a section
  is the base — you cannot hear a move away from a thing not yet stated.
- **A departure returns.** The last statement comes home. That is cadence, and
  it is why a section sounds finished rather than cut off.
- **It may not sit still three times running** — the rule of three, one level up.

Everything between is drawn, with `away` the share of middle statements that
leave the base. **48 distinct shapes are heard across 776 sections**, where four
were written down. And `NEEF` occurs **zero** times, because "a departure
returns" makes the last statement come home — Smoke's `F` on the fourth *is* a
return to the origin pitch. The hardcoded default had copied the letters and
lost the meaning.
Diatonic, so the key holds by construction; the rhythm untouched, so every
established figure stays recognisable. First letter of every default shape is
`N`: a sequence departs from something heard. `theme.seq: false` refuses;
`by`, `dir` and `roles` reshape it. The lead and counter move; the ostinato
stays anchored, a ground under a moving line.

Proved on the same seed: statements go base, base, **elevated**, **fallen**,
home — same rhythm `1/1/5/2` throughout. Fifty records sampled: all fifty now
carry their most-heard figure at more than one pitch level.

### The break

One bar of the record loses **one note** of its figure. Which bar is drawn per
record from a pool of statement numbers the genre declares — default `[3, 4]`,
the two the sheets name — and only from a section where the part that breaks is
actually playing. Never the downbeat, and never from a bar of fewer than three
notes: a break takes a note out of a phrase, it does not delete the phrase.

Measured against a build without it, 8 seeds a genre: **exactly one note
removed, in 26 records of 40.** The other 14 are records where the drawn bar
held no phrase big enough to take a note out of — the device declining rather
than failing.

Two faults, both found by diffing against a build without it rather than by
reading the code:

- It matched the statement NUMBER alone, and `occurrence` counts per *function*
  — so the third verse, the third chorus and the third instrumental all broke,
  and the material loops inside each. **3 to 36 notes went from a record where
  the device is one.** A break that happens thirty times is a thinner.
- Fixed to one bar, it then chose bars in sections the lead sits out, landing in
  23 records of 40. A break nobody hears is not one.

---

## 9. HOW IT IS PROVED

`node harness/mk2_roll.js` — a phrase copying itself is a picture, and the
picture is what showed it. Print before and after; read it.

`node harness/mk2_score.js` — the figures: the movement histogram, the `N`
count, each motif's span in each statement.

And two numbers carry the build:

- **Of 199 records, how many have a lead whose second half copies its first.**
  It was 157 and is 88. A phase that does not move it has not been applied.
  *The bass's 69 is NOT this measure — see §6; it counts the chord loop's
  period, not a fault.*
- **Distinct bar rhythms per record, per line.** This is the measure that says
  whether a line is made of cells. The bass is at 1.81 and the number is only
  meaningful read per genre.
- **How different two records of the same genre are from each other.** If every
  lofi record comes out with the same make-up, the dials were written as values
  and the whole point has been missed.

**And a warning about this sheet's own evidence.** The three measured songs are
where the DEVICES came from and they are good for that. They are not reasons.
"Chop Suey does it" is one record's make-up; a reason has to come from the
program's own state or from a law. Phase 6 was written the wrong way round and
would have reversed a fix the owner asked for six times.

---

## 12. THE ENGINE RAN BACKWARDS — and the reversal, built 2026-08-30

> [owner:] *"I think we built the Melody Math Engine WRONG."*

Right, and the fault is one sentence: **the program wrote the notes first and
named the motifs afterwards.**

`buildTheme.phrase` drew onsets seat by seat out of `onsetPool` and drew a fresh
movement for every note. Only after the array was finished did `MM.readLine`
chop it into cells and name them. So melodic math was a **label**, not a
generator — it could describe any tune and could not cause one. The proof was
sitting in the file: `materials.motifs` was written once and **read nowhere**,
and its own comment said *"Nothing consumes it yet."*

Every measured symptom in §6 and in `interval-encoding.md` §10 falls out of that
one fact:

- **L5 measured 4.23%** ("every movement is stated"). It was never a law that
  failed — it is an automatic consequence of building from motifs, and nothing
  was building from motifs.
- **The lead's rhythm copied itself in 76% of records.** There was one phrase
  and edits to it, not an inventory to choose between.
- **Nine of §5's dials grep to zero.** They are settings for a motif generator
  that did not exist.
- **`moveUnit` and `silent` parse and are read by nothing** — same reason.

And the build order shows how it happened. Phase 1 was *parse and print*, phase
2 *read the current tune into cells*, phases 3–5 *vary the finished array*.
**There was never a phase that composed the tune out of motifs.** It went from
describing straight to varying and skipped generating.

There is external support for how easy this was to do. `interval-encoding.md` §9
records Rami Yacoub, of Cheiron, on how the doctrine is actually used:
*"We never start writing by implementing the melodic math."* It is a thing you
check a melody against afterwards. **The program had faithfully built the
diagnostic.**

### What was built

Two splice points in `buildTheme`, and the laws downstream were not touched.

```
BEFORE   per bar: draw onsets from onsetPool
         per note: move = wpick(rng, MOVES) * dir
         at the end: MM.readLine names the cells

AFTER    once per line: draw an INVENTORY of 2-3 motifs
                        (rhythm from onsetPool, movements from theme.moves)
                        and a FORMULA over the slots
         per bar: play the slot the formula names
         per note: move = the motif's, already stated
```

- **The inventory** draws three motifs and keeps two or three, so the stream
  spends the same either way [Law 7]. Each motif is a rhythm plus one movement
  into each of its notes. Density comes from `count.hooky` or `count.normal`
  according to the line, which is what the genre already declares.
- **The formula** is *state, contrast, restate, depart* — slot 0 opens, slot 1
  must differ, slot 2 restates slot 0, slot 3 is the only free draw. That is the
  one property `melodic-math.md` §3's two formulae share: `A+B+A+C+A+B+A+c` and
  `A+a+B / A+A+B` are different shapes, but in both the opening cell comes back
  after one contrasting slot. It is also the classical period.
- **`materials.motifsDeclared`** publishes what each line was built from, beside
  the reading. The declaration is now the cause; the reading is a check on it.
- **The borrowed rhythm defers to the formula.** "The answer says it in the same
  rhythm" is now the formula's job — slot 2 restates slot 0's cell, so the
  answer carries the question's rhythm because it is playing the question's
  cell. Leaving the old borrow to fire on a bar the formula sent elsewhere made
  every record `A+B+A+B`.

**L1 and L5 are now true by construction rather than policed.** There is nothing
else for a line to be built from, and there is no per-note movement draw left in
the file.

### Measured, 40 seeds a genre, material A lead

| | 2nd half = 1st (rhythm) | distinct bar rhythms | mean interval (st) |
|---|---|---|---|
| lofi | **31/39 → 11/39** | 2.08 → **2.51** | 2.77 → 2.87 |
| synthwave | 32/40 → 29/40 | 2.20 → 2.27 | 2.65 → 2.67 |
| dungeonsynth | 30/40 → 27/40 | 2.27 → 2.30 | 2.86 → 2.86 |
| ds2 | 30/40 → 27/40 | 2.27 → 2.30 | 2.86 → 2.86 |
| **total** | **123/159 (77%) → 94/159 (59%)** | | |

lofi carries the change because it is the genre with no `verseHook`: its answer
used to copy the question's rhythm and now plays a different slot. The three
hook genres keep a high copy rate **by design** — `verseHook` restates bars 0-1
at 2-3 verbatim, and that is the hook working, not a defect.

The mean interval is unmoved at 2.55–2.87 semitones, so the reversal did not
cost the genres their interval budget. `%N` stays 0.0% on the lead, so
`noRepeats` is undisturbed.

### Two faults found by measuring, both mine, both fixed

- **The measurement was wrong first.** `composeSong` is positional
  — `(seed, rig, genre, …)` — and the first probe passed an object, so it
  composed the same default song 160 times and reported 40/40 and "exactly
  3.00" with no variance. The repo's own law caught it: *when a measurement
  surprises you, suspect the measurement first.* Every number above is from the
  corrected probe, whose control reproduces the audit's figures to two decimals.
- **The inventory read `count.normal` for every line.** A genre whose material A
  is a hook draws from `count.hooky`, so dungeon synth's motifs were built at
  1-2 notes instead of 4-5. Seed 19's lead went from 18 notes to **one**, in all
  three materials. A motif-first engine has no per-bar redraw to hide a starved
  cell behind, which is the one new class of risk this design carries: a bad
  motif is a whole-line fault, not a one-bar fault.

### What is still not built

- The **upper/lower-case slot formula** — `A+a+B / A+A+B`, a slot written and
  not sounding. The inventory and formula are the ground it needs, and now
  exist; the case flag does not.
- **Silence as a named motif with a span** (`S = 6`). The breath is still
  fragmentation of the sounding cell, not a slot of its own.
- `alterHead`, `freeTail`, `rhythmOf` across lines — still absent, as §8 said.
- **`displace`, `subdivide` and `swap` still operate on the finished note
  array.** They should operate on the motif and the formula. That is the next
  phase and it is where the change vocabulary stops being edits and becomes
  variation of a thing with parts.
- The eleven dials of §5 are still engine literals. The inventory is what would
  read them, so they are now buildable where before they were not.

**Verified:** `mk2_syntax` parses clean; `mk2_mm` reads 31 motifs and every one
round-trips; `mk2_roll` composes all four genres on two seeds; 159 of 160
records compose, the one failure being the pre-existing `lofi seed 17` seam
throw that predates this work.

---

## 13. THE LOWER-CASE SLOT, AND WHAT THE EQUATION IS ACTUALLY FOR

> [owner:] *"The lower case letters are silent parts and isnt the melodic math
> meant to allow the program to alter the motif in random ways but the equation
> keeps a constraint on what can be altered?"*

Both right, and the second is a better statement of the design than §12's.

**The equation is not a playlist of cells. It is the thing that makes altering
a cell safe.** §2's balance rule — `A = 4+3+1+4 = 12`, `B = 4`, `A+B = 16`,
"factors into 4/4" — is what lets a slot be substituted: any variation that
still occupies the same **span** drops into the same equation and the bar
arithmetic still holds. So the inside of a cell is free and its length is not.
That is this program's fourth principle at motif scale — *novelty, constrained*
— and the constraint is arithmetic rather than taste.

### Built

**Lower case — a slot written and not sounding.** `melodic-math.md` §3 called
this "the single most important diagram" and "the mechanism this program does
not have", and it needed the inventory and formula of §12 to exist first. Two
constraints, and they are why it is safe to draw:

- **slot 0 always sounds** — you cannot turn off a cell that has not been
  stated; there is nothing for the silence to be a hole in
- **at most one slot is silent** — a four-bar loop missing two bars is not a
  phrase with a rest in it, it is a shorter phrase

`theme.silentSlot` is the chance, default 0.25, and no genre declares it yet.

**The alteration, and the span is what constrains it.** The device is the
Europe sheet's own, named on its diagram: `A = 1(i)1(i)4` becomes
`A2 = 1(i)1(i)2(i)2` — *"the last note split into 2, still taking up the same
amount of space, but allowing for an extra key change… we can call this
rhythmic acceleration."* Splitting fills a gap and moves neither the first
onset nor the last, so **the span is preserved by construction rather than
checked afterwards** — no correcting pass, which is the house rule.

It applies only to a **restatement** — a slot already sounded earlier in the
formula — because a variation of something not yet heard is just a different
cell. `theme.varySlot` is the chance, default 0.5.

**And a hook alters nothing, and now says so.** A `verseHook` line writes bars
0-1 and copies them to 2-3 as notes, so slots 2-3 never play. The first version
of this declared a silent or varied slot there anyway: 11 records of 40 claimed
a rest that could not sound and 36 claimed a variation that never ran. That is
a declaration not matching what happens, which this project holds to be worse
than none. The hook's equation is now written out as what it is — `A+B+A+B`
with the alteration budget at zero, which is itself a melodic-math formula.

### Measured, 40 seeds a genre, material A

```
                 silent slot   varied slot   distinct formulae   themeA hooky
  lofi             10/39         32/39            20              0/39
  synthwave         3/40          0/40             3             40/40
  dungeonsynth      5/40         14/40            14             26/40
  ds2               5/40         14/40            14             26/40
```

The formulae now print the way the sheets write them:

```
  A+B+A2+A   A+B+A2+B   A+B+A+A   A+B+A2+C   A+B+A2+b
  A+C+A+C    A+b+A+b    A+B+A+B2  A+B+A+b
```

Twenty distinct formulae in lofi where §12 left it with one shape. The
variation counts track hookiness exactly — dungeon synth is hooky in 26 records
of 40 and varies in the other 14, which is 40 − 26 and not a coincidence: the
devices reach the lines free to move and leave the hook alone.

The lead's rhythm copying itself moved again in the one genre free to show it:
**lofi 31/39 → 11/39 (§12) → 8/39.** Mean interval unmoved at 2.81; `%N` still
0.0.

### Still not built

- **Silence as a named motif with a span of its own** (`S = 6`). A lower-case
  slot is a whole bar; the sheets' `S` is a cell like any other and can be six
  sixteenths inside a bar.
- **The other span-preserving alterations.** Splitting is one. The sheets also
  name **swapping two lengths** (Televators: `4(E3)2(N)4…` → `2(E3)4(N)4…`,
  same span, attacks moved) and **a note missed** for deliberate imbalance.
  `MM.swap` and `MM.subdivide` already exist and still operate on the finished
  note array rather than on the cell — moving them onto the motif is the next
  phase and would make the change vocabulary one thing instead of two.
- `theme.silentSlot` and `theme.varySlot` are engine defaults that **no genre
  declares**, which is §5's complaint again. They are now dials that exist and
  can be declared, where before there was nothing to declare them to.

**Verified:** `mk2_syntax` clean; `mk2_mm` 31/31 round-trip; `mk2_roll` composes
all four genres; 159 of 160 records compose, the one failure the pre-existing
`lofi seed 17` seam throw.

---

## 14. AND THE SHAPE OF THE FORMULA WAS BAKED IN — twice

> [owner:] *"the formulae can be anything with in bounds and is not baked in
> what it must be correct?"*

Correct, and it was not. Two cuts of §12/§13 hardcoded the shape:

1. `A+B+A+C` written out entirely.
2. `f[2] = f[0]` — so every formula in the file came out **`A+?+A+?`**. The
   printout showed twenty "distinct formulae" in lofi and they were twenty
   spellings of one shape.

This is the project's own recurring defect and the file names it twice
elsewhere: one song's make-up shipped as a default and called a pool, exactly
as the per-statement sequence table shipped `NEEF` — *Smoke On The Water*'s own
letters — as the default for every genre.

**What is actually law is only what `melodic-math.md` §3's two formulae agree
on**, and `A+B+A+C+A+B+A+c` and `A+a+B / A+A+B` agree on two things:

- **L2, a motif comes back.** All slots different is no hook.
- **L4, something changes.** All slots the same is a loop.

**Where the restatement falls is not law.** It is drawn now, and the rescues
that enforce L2 and L4 pick their position from the stream too, so a formula
needing one does not get a fixed answer. `A+A+B+C`, `A+B+B+C`, `A+B+A+C` and
`A+B+C+B` are all reachable.

The one line that still carries a positional constraint is the **hook**, and
the constraint belongs to the hook rather than to formulae: a `verseHook` line
plays bars 0-1 and copies them to 2-3, so those two bars are the whole tune —
if they name the same cell the material is one cell four times, which L4
forbids.

### Measured, 40 seeds a genre, material A lead

```
                 distinct formulae      2nd half = 1st (rhythm)   distinctRhy
  lofi            20  ->  31             8/39  ->  2/39           2.51 -> 2.87
  synthwave        3  ->   3            29/40  -> 29/40           2.27 -> 2.27
  dungeonsynth    14  ->  15            27/40  -> 27/40           2.30 -> 2.30
  ds2             14  ->  15            27/40  -> 27/40           2.30 -> 2.30
```

lofi is the genre free to show it — no `verseHook` — and it is where the change
lands: 31 shapes, and its lead's second half now repeats its first in **2
records of 39**, from 31 of 39 before any of this work. Shapes now reached that
`f[2]=f[0]` made unreachable: `A+B+B2+A`, `A+A2+A2+C`, `A+C+A+B`.

synthwave stays at three because it is hooky in 40 records of 40, and a hook
is `A+B+A+B` by definition. That is the declaration being honest, not a dial
stuck.

Mean interval unmoved at 2.67–2.86 semitones; `%N` still 0.0.

**Verified:** `mk2_syntax` clean; `mk2_mm` 31/31 round-trip; `mk2_roll` composes
all four genres; 159 of 160 records compose, the one failure the pre-existing
`lofi seed 17` seam throw.

---

## 15. REBUILT FROM THE SHEETS — a cell is a length, not a bar

> [owner:] *"What do you mean by tune A? The letters of the motif are the parts
> of a motif broken down into its smallest nature."*

§12–14 built cells that were each exactly one bar long. That is wrong, and it is
wrong in the way that empties the whole idea: **if every cell is a bar, nothing
can add up to anything, and the arithmetic does no work.**

The sheets are unambiguous. A letter is a small piece with a length:

```
Smoke On The Water    A = 4+4 (8)    B = 6    C = 2+8 (10)      A+B+A+C = 32
Nobody Else, bass     A = 1/1/1/1/2 (6)   B = 2/2 (4)           A+A+B  = 16
Nobody Else, melody   A = 4+3+1+4 (12)    B = 4 (4)             A+B    = 16
                                                 "(factors into 4/4) BALANCE!"
```

A is half a bar in one sheet and three bars in another. So a cell is **a run of
note lengths whose sum is its span**, and the formula lays cells end to end
until the spans reach whole bars.

### What is built

- **Cells** are drawn as lengths off a pool (`theme.lengths`, default
  `1,2,3,4,6,8` — every value appears in the sheets), with one movement between
  each pair of notes. The span is the sum.
- **A cell is capped at a third of the material.** Half was the first cap and it
  is not enough: two cells of fifteen fill a two-bar hook exactly and neither
  can recur. Measured — dungeon synth seed 3 came out `B + A + S3`, a formula
  with no hook in it. A third makes L2 reachable by arithmetic instead of by
  rescue, and it is what the sheets do (8, 6 and 10 filling 32).
- **The formula fills to the target**, weighting a cell already heard over a new
  one, which is what produces `A+B+A+C` rather than four different letters.
- **`S` is the piece that makes the equation come out.** Whatever span is left
  becomes silence — the sheets' own cell, and the sheet's own reason:
  *"the 'S' motif (which represents silence) keeps the other motifs happening at
  the same time... acting like a Call & Reponse."*
- **Lower case keeps its span and stops sounding** — *"The 'B' rotates from
  being active and inactive to give rest."*
- **The last sounding occurrence turns** — *"The 'A' motif elevates on the first
  3, but on the 4th one it falls, giving variation and a sense of closure by
  ending where the melody starts."* The cell's movements are mirrored on its
  final audible statement. Marking the final occurrence regardless of case put
  the turn on a silent slot — a closure nobody can hear — so it is the last
  slot that SOUNDS.
- **The rhythm of a cell never changes once drawn.** Its pitches float, because
  the line reaches each restatement from somewhere else — which is *"change
  their key and contour to stay interesting"* falling out of the construction
  rather than being applied to it.
- **The old rhythm-borrow is gone.** "The answer says it in the same rhythm" is
  what a formula naming the same cell twice already does, exactly and by
  construction.

### Measured

```
  lines checked for balance    954        UNBALANCED: 0
                                          every line's spans sum to its bars

                 records   planned notes   played   played%   a cell recurs
  lofi              39          650          621     95.5      39/39
  synthwave         40          375          356     94.9      38/40
  dungeonsynth      40          545          465     85.3      39/40
  ds2               40          545          465     85.3      39/40
```

**Balance is exact on all 954 lines.** 85–96% of planned notes reach the record;
the rest are refused because another part owns the seat — visible in the roll as
a cell that is missing one of its notes, and the largest remaining gap.

### Read against the notation

Three records, printed as the sheets draw them — the boxes are the cells the
program declared BEFORE it wrote a note, the black bars are what it then wrote:

```
dungeonsynth seed 3    B + A + a + S3        9+10+10+3 = 32
  B = 6+2+1   D5 held 6, C5 for 2, G5 for 1        three notes, exact
  A = 2+8     D5 for 2, D#5 held 8                 two notes, exact
  a           the same cell, ten sixteenths, silent
  S3          three sixteenths of the sheets' own silence cell

synthwave seed 12      B + B + B↓ + S5       9+9+9+5 = 32
  B = 2+2+3+2  stated three times in the same rhythm at three pitch levels,
               and the third one descends where the first two rise

lofi seed 36820        C + A + A + A + A↓ + S1    15+12+12+12+12+1 = 64
  A stated four times, the fourth turning home — the Smoke On The Water shape,
  reached by draw and not by being written down
```

### Still not built

- `A2`, the split variation — *"the last note split into 2, still taking up the
  same amount of space."* §13 built it against bar-sized cells; it has to be
  redone against lengths.
- The swap (Televators) and the missed note for deliberate imbalance.
- `theme.lengths`, `theme.silentSlot` — dials that now exist and no genre
  declares, which is §5's complaint with somewhere to land at last.

**Verified:** `mk2_syntax` clean; `mk2_mm` 31/31 round-trip; `mk2_roll` composes
all four genres; 159 of 160 records compose, the one failure the pre-existing
`lofi seed 17` seam throw.

---

## 16. AN EXAMPLE IS NOT A FACT — the dials become weights

> [owner:] *"I think you might be making assumptions about an EXAMPLE and
> EXAMPLE is not a fact in of itself it is generally just ONE way to do many
> things is it not?"*
>
> [owner:] *"even the dials shoulnt be strict on or offs that would be a switch
> right"*

Both right, and §15 was written on the strength of four sheets read as though
they were a specification. **Two MIDI files the owner supplied settle it, and
they disagree with each other on the thing §15 called the law.**

### Measured off the MIDI, not off a sheet

Both parsed at PPQ 480, a sixteenth = 120 ticks, phrases split on rests of six
sixteenths or more.

**System of a Down, "Chop Suey" — Serj's vocal, 367 notes, 32 phrases.**

- A **fixed grid**, strictly. The verse cell starts at sixteenth 528, 560, 592 —
  every 32 exactly — and is 20 long, so `A(20) + S(12) = 32`. The Europe
  sheet's silence cell, measured in a song nobody drew.
- The cell is `2+2+2+2+2+2+2+2+2+2` on ONE PITCH: `G4 ×9, F#4`. Its restatement
  two bars later is the same rhythm on `F#4 ×8, G#4, G4`. **Rhythm held, key
  moved.**
- Lengths of **3** recur (`3+3+2+4+4+2+2`, identical at bars 51 and 85) — not a
  power-of-two grid.
- The second verse is a **byte-for-byte copy** of the first: 148 sixteenths,
  every length and every pitch, 34 bars later.

**The Mars Volta, "Televators" — Cedric's vocal, 324 notes, 19 phrases.**

- **No grid at all.** Phrases span 20 to 144 sixteenths and start at `@2`, `@4`,
  `@8`, `@12` within the bar. Never twice in the same place.
- The cell `F#4 E4 D4 D4` comes back as `4+4+4+12`, then `2+4+6+12`, then
  `2+4+6+12` — **same pitches, same span of 24, the rhythm redistributed
  inside it. Pitch held, rhythm moved.**
- And `B3 D4 D4 B3 E4 F#4` comes back `4+2+4+2+4+8` (24) then `2+4+4+2+4+4`
  (20) — first two lengths swapped, tail shortened. Not even the span held.
- The Europe split is here too: phrase 9's `…12+12` is phrase 10's `…12+6+6`,
  the same 12 carrying a new pitch. *"Rhythmic acceleration"*, independently.

| | Nobody Else | Chop Suey | Televators |
|---|---|---|---|
| fixed grid | yes, 16 | yes, 32 | **no** |
| what is kept | rhythm | rhythm | **pitches** |
| what moves | key | key | **rhythm** |
| on the bar | yes | yes | **no** |
| repeated pitch | no | **nine in a row** | no |
| section repeats verbatim | with variations | **exactly** | no |

**Every row is a disagreement.** `melodic-math.md` §1 — *"a motif is recognised
by its RHYTHM; its pitches are free"* — is Nobody Else's habit and Chop Suey's,
and it is the opposite of Televators'. It is stated in this repo as the load-
bearing claim and it is one example generalised.

### And a dial is not a switch

A switch gives two songs. This project's second principle already says what a
dial is: *"A soft law is a habit with **weights**, and lives in the genre tables
where a genre can lean on it or not."*

So `theme.keep` is drawn at three levels, which is this program's usual shape:

```
  the GENRE declares a range      keep: { rhythm: [0.55,0.95], pitch: [0,0.35] }
  the SEED draws one per record   rhythm 0.71, pitch 0.19, span 0.10
  each RESTATEMENT rolls          keep the rhythm / the pitches / only the span
```

Three draws a slot, always, so the stream does not move with the outcome
[Law 7]. Measured across 159 records the drawn weight ranges **0.55–0.92**, so
two records of one genre genuinely lean differently.

- **rhythm** — same lengths, pitches free. What the engine always did.
- **pitch** — the pitches the cell was FIRST HEARD at, played again, with the
  lengths redistributed inside the span. Televators' device, built as `reflow`,
  which moves units between lengths so the span cannot drift.
- **span** — only the slot's place in the equation is kept; everything inside is
  redrawn. The loosest restatement L3 allows.

### AND THE PROGRAM WAS ERASING ITS OWN WORK

> [owner:] *"make sure this is hooked up into the program and that the program
> does not ignore or erase its work"*

It was, and measuring for it found the fault.

**The release draw was keyed on the bar.** `det:…:rhyBar:steps[i]` — but a cell
does not sit at the same bar and step every time it is played; that is the whole
point of a formula. So the same note of the same figure drew a **fresh coin at
every statement** and came back a different length.

**This is the third time this exact fault has appeared in this file.** `thin`
had it seeded on the record's bar — *"the same note of the same figure drew a
fresh coin at every statement"* — and was fixed. The sequence table had its own
version. Here it silently undid the law above it.

Keyed on the CELL and the note's index inside it:

```
  restatements that kept every note AND came back with the exact rhythm
      before the fix      19 of 182
      after the fix       74 of 179          ~4x
```

Two smaller erasures fixed the same way: a **held pitch takes its own octave**
before the seat-walk steps it onto a different note, and a **held pitch is
exempt from the peak rule**, which was nudging restatements off the very pitch
they exist to repeat.

### Where it stands, measured, 40 seeds a genre

```
  268 restatements compared against the first statement of their own cell

     kept every note                     179  (67%)
     lost at least one to a collision     89  (33%)

     of the 179, rhythm restatements that came back exact        74
     held pitches that survived, per note                    35 / 60  (58%)

  balance                       954 lines checked, 0 unbalanced
  distinct bar rhythms, lofi    2.51 -> 3.77
```

**What is honestly not finished:** a third of restatements still lose a note to
another part owning the seat, and 42% of held pitches are still moved by the
laws downstream. Both are measured rather than claimed, and both are the same
question — how much a decided note may be overruled — which the next pass
should answer once rather than in three places.

### AND THE SONGS ARE NOT TARGETS

> [owner:] *"STOP talking about songs like they are goals! We are building the
> melodic math engine!"*

This section first shipped `keep` with a default of `rhythm [0.55,0.95]`,
`pitch [0,0.35]` — a range shaped to lean on the rhythm because two of the
songs read here happen to. **That is a song used as a goal**, and it is the
same defect the file has already caught twice: `NEEF` shipped as a default
because one riff spelled it, `A+B+A+C` written out because one riff spelled
that. Three times now, from three different directions.

A song is **evidence that a capability is real and gets used** — Televators
proves a line can hold its pitches and move its rhythm, so the engine must be
ABLE to. Nothing follows about what anything should sound like.

So the default is now the widest range the law allows, `[0,1]` on both, and
**narrowing it is the genre's job.** An engine that can only express what four
sheets happened to do is a transcription tool, not a generator.

Measured after widening: the drawn weight now ranges **0.01–0.89** across
records (it was 0.55–0.92, i.e. the default was doing the choosing), and
pitch-keeping restatements went from 17 to 44 in lofi, 26 to 69 in dungeon
synth. The capability was there and the default was suppressing it.

`theme.keep` is declared by **no genre**. That is the open work, and the ranges
have to come from what a genre needs, never from what a record does.

**Verified:** `mk2_syntax` clean; `mk2_mm` 31/31 round-trip; `mk2_roll` composes
all four genres; 159 of 160 records compose, the one failure the pre-existing
`lofi seed 17` seam throw.

---

## 17. THE OTHER DIALS, AUDITED FOR SONG VALUES

> [owner:] *"Now check the other dials for baked in song values"*

Six found. One of them is the same defect as §16's, committed in the same
section an hour earlier.

| was | where it came from | now |
|---|---|---|
| **the turn, applied always** | Smoke On The Water | `theme.close`, default `[0,1]` |
| cell span capped at `SPAN_T/3` | this file's own comment: *"Smoke On The Water is 8, 6 and 10 filling 32"* | `theme.cellMax`, default `[0.2,0.5]` |
| length pool `1:2 2:5 3:2 4:5 6:2 8:1` | weighted to look like the sheets | flat `1:1` across, genre reweights |
| 2 or 3 cells | literal | `theme.cells`, default `[2,4]` |
| heard cell outweighs new `5 : 2` | a number chosen to make `A+B+A+C` come out | `theme.recur`, default `[1,8]` |
| `silentSlot` 0.25 | a single number | a range, default `[0,0.5]` |

### The worst one

```js
for(const mi in lastOf) if(sounded[mi] > 1) slots[lastOf[mi]].flip = true;
```

Unconditional. **Every cell that sounded twice had its last statement mirrored,
in every record of every genre, forever** — because one riff does that:

> "The 'A' motif elevates ('E') on the first 3, but on the 4th one it falls."

Nobody Else does not do it; its `B` rotates on and off instead. Televators does
not; it redistributes rhythm. It is one song's device promoted to a law of the
engine — **the third time this file has caught that pattern, and the second time
in this section alone.**

It is now `theme.close`, a weight drawn per record over the whole range: some
records close every recurring cell, some none, most in between.

### Measured, 40 seeds a genre

Every dial drawn per record, and every one moves across nearly the whole range
it is allowed:

```
  rhythm 0.01-0.89   pitch 0.00-0.94   close 0.01-1.00
  silent 0.01-0.50   recur 1.25-7.71   cells 2-4

  distinct formulae   lofi 39/39   synthwave 38/40   dungeonsynth 39/40
  balance             954 lines, 0 unbalanced
  lofi distinct bar rhythms   2.51 -> 3.85
  lofi second half copies first   2/39 -> 0/39
```

**The dials read the same for all four genres, and that is correct rather than a
bug: not one genre declares any of them.** They all run the widest default the
law allows. Narrowing them is the genre's job and it is the open work — and the
ranges have to come from what a genre needs, never from what a record does.

### The rule this section is really about

A song is **evidence that a capability is real and gets used.** It is never a
target, and it is never a default. Three times now this file has shipped one
riff's spelling as the engine's behaviour — `NEEF`, `A+B+A+C`, and the turn.
Each time it looked like a pool and was one example wearing a pool's clothes.

**Test for it:** if a default can be traced to a particular record, it is a
defect, whatever it sounds like.

**Verified:** `mk2_syntax` clean; `mk2_mm` 31/31 round-trip; `mk2_roll` composes
all four genres; 159 of 160 records compose, the one failure the pre-existing
`lofi seed 17` seam throw.

---

## 18. THE REST OF THE LIST — what got built, and what did not

Working through everything the notation can say that the engine could not.

### Built

**The three devices, all span-preserving by construction** — `split` (the
Europe sheet's `A2`, the new note carrying its own movement because that is the
point of it), `drop` (*"a note is missed to create unbalance"*, the length going
to the note before, never the first), `swap` (Televators, `4+2+4+2+4` returning
as `2+4+4+2+4`). Weighted flat by default, doing nothing included. Measured over
159 records: split 84 slots, drop 71, swap 52; 91 records carry at least one;
balance still exact on all 954 lines.

**`S` is a cell you place.** It could only ever be the remainder at the end —
arithmetic, not a job. It now has a declared span (`theme.restLen`) and is drawn
into the formula like any other cell (`theme.rest`), with the mop-up kept as the
guarantee the balance closes. Formulae now read `A + A~ + S13 + A + A + S3`.

**A movement may state its direction.** `4(ii)4` is magnitude 2 with *"the
direction… up to your own personal taste"*; `4(E2)4` is up 2, stated, *"to give
a strong sense of familiarity"*. Every movement took its sign from the phrase,
so a motif could carry a size and never a direction — half the notation with no
way to say it. `theme.stated` is the weight.

**`noRepeat` — four gates, two senses, and the two that mattered were dead.**
`!== false` and `!(=== false)` default it ON; `JOIN` and the stage-5 merge tested
it **truthy**, against a flag no genre sets. So the material-level rule ran and
the record-level ones never did:

```
  lead + counter transitions, 25 seeds a genre
     before   1402 repeated pitches of 33,321   4.21%   worst record 55
     after        0 of 31,905                   0.00%
```

That is the owner's six-times-reported complaint, and it was fixed where the
notes are composed and not where they are heard. The file documents this exact
failure pattern twice in its own comments and it had happened again in two more
places. Now read once, from one helper, and every site agrees.

### NOT built, and why

**The engine is a LEAD engine, not a LINE engine — the biggest gap left.**
`buildBass`, `buildOstinato` and `deriveCounter` contain **zero** cell
machinery: no inventory, no formula, no plan, no weights. Confirmed by grep.

This matters more than anything else on the list, because **two of the owner's
eight sheets are a bassline**, and this document's own opening says:

> *"This is not a melody engine. It is a LINE engine… the owner's own Nobody
> Else sheets analyse a bassline in exactly this notation, and the bass turns
> out to need it more than the melody does."*

It is not built here because `buildBassLine` is ~780 lines of recently-corrected,
sourced work — bass roles, pockets, approach tones, the pedal fix of phase 4 —
and bolting cells onto the end of another pass would risk all of it. **It needs
its own pass**, and the shape of that pass is: lift the inventory/formula/plan
out of `buildTheme`'s closure into something any line can call, wire one line to
it first, measure, then the rest.

**`moveUnit` is still parsed and read by nothing.** The generator is
unconditionally scale steps. Semitone movement can leave the key, and the seam
check throws on an out-of-key note, so switching it on without a resolution rule
would break records. It needs the rule first, not the flag.

**The layout is redrawn per record, which is neither of the two things the
songs do.** Chop Suey holds a strict 32-sixteenth grid across the whole verse;
Televators has no grid at all. The engine does a third thing. `redraw:
["record","section"]` is named in §5 and is a stage-5 question, because that is
where the material loops.

**Balance is compulsory.** `SPAN_T` is always whole bars. Televators' phrases
are not, so this is a dial that does not exist yet.

**No genre declares a single dial.** Every one runs the widest default the law
allows. The ranges have to come from what a genre needs, sourced, and inventing
them would be the same defect this document has now caught four times.

**Verified:** `mk2_syntax` clean; `mk2_mm` 31/31 round-trip; `mk2_roll` composes
all four genres; balance 954/954; 159 of 160 records compose, the one failure the
pre-existing `lofi seed 17` seam throw.
