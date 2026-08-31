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

---

## 19. THE LINE ENGINE PASS

> [owner:] *"do the line engine pass now"*

§18 recorded the biggest remaining gap: the engine was a LEAD engine. `grep`
returned **zero** cell machinery in `buildBass`, `buildOstinato` and
`deriveCounter` — while two of the eight sheets the notation comes from are a
**bassline**, and this document's own first paragraph says:

> *"This is not a melody engine. It is a LINE engine… the owner's own Nobody
> Else sheets analyse a bassline in exactly this notation, and the bass turns
> out to need it more than the melody does."*

### 1. The engine is lifted out, and it is proven neutral

The inventory, formula, plan, devices and weights were written inside
`buildTheme`'s closure. They are now `mmLine(streamName, spanT, TH, hooky)` and
**take their table as an argument** — every dial is per LINE, which is what §5
has said since it was written and what a closure could not express.

Nothing about the lead changed in the lifting, and that is measured rather than
asserted: every note of every material of every role, four genres × 25 seeds —

```
  lines compared 21,610      differing 0      IDENTICAL
```

### 2. The bass can be built of cells

Not as a replacement for the five bass roles — as a **sixth role**, drawn from
`bassRoles` per material exactly like the others. A genre whose bass is a pedal
or a sequencer is untouched; none of the existing roles moved.

The `Nobody Else` bassline is analysed in the notation exactly as its melody is:

```
  A = 1/1/1/1/2 (6)    B = 2/2 (4)    A+A+B = 16, one bar
  Structural Formula:  A+a+B / A+A+B / A+a+B / A+a+b
```

and what the sheet says about it is a bass instruction, not a melody one:
*"The 'A' and 'B' motifs always stay in the same rhythm… kept interesting by
changing the ORDER the 'A' & 'B' is played and by CHANGING KEY."*

**Its own table** — `bassTheme` if the genre declares one, `theme` if not.
**The harmony places, the cell shapes**: a cell starts from the chord root,
moves by its own movements, and folds into the octave around that root — a bass
says which chord this is, and a cell that wandered out of the register would be
a melody played low. Same order the lead uses.

### 3. Measured, with the role forced on

The role is reachable and undeclared, so it had to be tested by forcing it, not
by trusting that it would work if asked:

```
                  records   notes/record   distinct bar rhythms
  lofi              24          14.8              3.75
  synthwave         25          14.9              3.76
  dungeonsynth      25          17.7              3.84
  ds2               25          17.7              3.84
```

Against the bass the audit measured on the old roles — 1.98 to 2.46 distinct bar
rhythms — a cell-built bass is markedly more varied. One record threw, and it is
the pre-existing `lofi seed 17` seam error, not this.

A worked example, lofi seed 3, the bass publishing its own working beside the
lead's:

```
  cells   : 2+8+2+1 (13) | 3+2+6 (11) | 6+2+2+8 (18) | 3+1+6+8 (18)
  formula : B + A + D + A + S9        balance 64 / 64
```

### What is still not done

- **The counter and the ostinato.** `deriveCounter` derives from the lead's
  notes and `buildOstinato` has its own figure logic. Both are lines and both
  should be able to ask; neither does yet.
- **No genre declares `cells` in its `bassRoles`.** The role exists and is
  reachable through the mechanism genres already use — that is a capability, not
  dead data — but choosing which genre gets it and at what weight needs a source
  for that genre, and inventing one is the defect this document has now caught
  four times.

**Verified:** `mk2_syntax` clean; the lift byte-identical over 21,610 note
lines; `mk2_mm` 31/31 round-trip; balance 954/954; `mk2_roll` composes all four
genres; 159 of 160 records compose.

---

## 20. THE LAWS HOLD BY CONSTRUCTION — L2 and L4 at 0 of 954

An 11-agent workflow scoped the five remaining items and adversarially challenged
each plan. **All five were refuted with high confidence**, and the completeness
critic found more than the five items did. What follows is what survived.

### The laws were never enforced

`melodic-math.md` and §14 both claim L2 and L4 are law. Measured across 954
declared lines, at the start of this pass:

```
  L2  a motif comes back — nothing recurs            68 of 954
  L4  something changes — nothing changes            70 of 954
```

They held the rest of the time **by accident**, through the pitch walk. And the
one rescue that existed reached back and rewrote a slot already drawn — a
correcting pass, which the house rules forbid outright.

Both are now **restrictions on the draw**, and the arithmetic that makes them
reachable is the interesting part:

- **A cell may be introduced only if it can come back** — `left >= 2 * span`.
  That is L2 stated as arithmetic. Three weaker versions failed first, each
  measured: waiting until one slot remained (the room was already spent, 46
  left); reserving the smallest cell in the *inventory* (let a wide cell in on
  the strength of a narrow one never used — `S52 + A + S5`); reserving the
  smallest cell *seen* (`A + B + S15`, neither able to fit the remainder).
- **A rest must leave room for a recurrence, not for two cells** — reserving two
  cell-widths let the two be different cells, and L2 went 23 → 67 the moment a
  leading rest was allowed.
- **When neither is available, stop** and let the mop-up rest fill what is left,
  rather than buy a slot at the cost of the law.
- **L4's device is decided after every keep is known.** Inside the keeps loop, a
  slot that is a cell's FIRST statement `continue`s past the rescue — `A + A + C
  + S2` escaped it entirely. The last restatement's device is the last free
  choice in the formula; when nothing else has changed, that choice is narrowed
  to the members that are a change.

```
  L2 violations   68  →  0        L4 violations   70  →  0        of 954
```

### The hand-over belongs to the cell

`MM.parse` has produced a `tail` since it was written — *"where the pitch goes
as this motif ends and the next thing begins"*. `mmLine` had none: the movement
INTO a slot was drawn fresh per slot, so the pitch level of every restatement
was a separate coin.

The cell now owns its outgoing movement. **Measured, and the first measurement
was worthless** — a cell stated twice has one interval and a set of one is
always "constant", so the test could not fail. Restricted to cells stated three
or more times, it went 4.1% → 9.2%, and then back to **2.2%** once the L2 work
made cells recur across more intervening material.

**So sequence proper is still not built, and that is the honest reading.** The
hand-over is necessary and not sufficient: the interval between two statements
accumulates through everything between them. Setting a statement's pitch level
directly is a different change, and it is the one `melodic-math.md` §4 names.

### The silence work

- **A line may open on a rest.** The Final Countdown sheet *does* — `S + A + B +
  S + A2 + B + …` — and its stated job is at the front of the bar: *"room for
  the chords to play at the START of every bar, acting like a Call & Reponse."*
  88 of 954 lines now open on one.
- **Every eligible slot rolls its own case, not one per line.** Measured: 0 of
  954 lines had two lower-case slots, so the sheets' own `A+a+B / A+A+B / A+a+B
  / A+a+b` was inexpressible — its last statement has two. The "at most one"
  rule was written in §13 when a cell was a whole BAR; §15 made a cell a LENGTH,
  and two silent three-sixteenth cells are nothing like two missing bars. A
  stale constraint from a superseded model. Now **125 lines carry two or more,
  52 carry three or more**.
- **Muting may not silence the recurrence itself.** Guarding only on "two slots
  still sound" let the mute fall on the second statement of the only cell that
  came back — `A + a` sounds once, and L2 is about what can be HEARD. L2 went
  23 → 63 before this was caught.

### Where it stands

```
  balance                954 lines, 0 unbalanced
  L2 / L4 violations     0 / 0
  repeated pitches       0.00% of 23,758 lead+counter transitions
  lines opening on a rest              88
  lines with 2+ lower-case slots      125
  mk2_mm                 31/31 round-trip
  records composing      159 of 160 (the pre-existing lofi seed 17 seam throw)
```

### Not done, and named

- **Sequence proper** — the statement pitch set directly rather than walked to.
- **The counter and the ostinato as cell lines.** Both plans were refuted:
  the counter's for verifying a configuration it did not propose and for dead
  code; the ostinato's for a fabricated citation, a song-traceable default span,
  and a `DECLARED` key collision across three call sites. The counter's core
  finding survives and is worth building on — `deriveCounter` **already has a
  weighted style pool** at its own line, so `cells` is a fourth member of an
  existing mechanism, exactly as it was a sixth bass role.
- **`moveUnit`** — verified dead on arrival for a deeper reason than a missing
  consumer: `scaleStep(0,'minor',61,0) === 60`. The function locates the nearest
  *degree* before adding steps, so a chromatic pitch cannot even be held. This
  is a pitch-representation change, not a dial.
- **`redraw` per section** — verified dead on arrival: the `takes` rail it would
  ride requires `materialTakes`, which **0 of 4 genres declare**.
- **The balance dial** — refused, and the reason is worth keeping: over-fill is
  silently discarded before a pitch exists, while `declared.formula` keeps
  printing the truncated cell whole. That is a declaration that lies, which this
  project holds to be worse than none.
- **No genre declares any of the twelve dials.** Still the standing work, and
  still the reason all four genres measure alike.

---

## 21. SEQUENCE PROPER — built, and the trade is not free

`melodic-math.md` §4 names two things the program cannot say. §17 built the
second, the turn. **This is the first**, quoted there verbatim:

> *"A motif's pitch level moves by a FIXED INTERVAL, the same every time — not a
> redrawn transposition. This is SEQUENCE proper. The engine's device draws ±1
> or ±2 scale steps at random each time, which is not a sequence — it is a
> wander."*

§20's hand-over was necessary and not sufficient: a cell that always leaves the
same way still *arrives* wherever the material between two of its statements
happened to end. **A sequence is not walked to — it is a pitch level the
statement is placed at.**

- The cell draws a `step` with itself, and every statement of it is placed at
  `first-statement pitch + lvl × step`.
- **The turn now means what the sheet says.** `theme.close` sets the last
  sounding statement's level back to 0 — *"a sense of closure by ending where
  the melody starts, on D"* — which was only expressible once a statement had a
  level at all.
- `theme.sequence` is the weight, default `[0,1]`.

### Three faults found by measuring, all mine

- **It threw.** `dungeonsynth seed 39`, Avarlift's lead: placing the note
  ignores where the line was going, and where it was going was the only
  resolution a hanging dissonance had. Placement now waits for the next onset,
  like every other choice here.
- **The climb compounds.** `lvl × step` asks for ten scale steps by the fifth
  statement, outside any register a line has. Bounded to a fourth either way.
- **A placement may land on the pitch it comes from.** Refused at the choice.

### The trade, measured, and it is not free

```
  cells stated 3+ times, statements at a constant interval    2.2%  ->  9.3%
  mean lead notes per record                                  11.1  ->  10.0
  repeated pitches, lead+counter                              0     ->  3 of 21,149
```

**That is roughly one note in eleven, for a device that lands 9% of the time.**
The reason it lands so rarely is the same reason it costs notes: a placed pitch
ignores the line's state, so the counterpoint laws — the dissonance must resolve
by step, the seat must be free — overrule most of it, and each overruled
placement leaves `m` somewhere the next note cannot reach.

⚠ **The 3 repeats are not explained.** The guard written for them did not move
the number; the cause is elsewhere and is not identified. It is 0.01% against
the 4.21% that prompted the original complaint, and it is recorded here rather
than left looking fixed.

**This one needs the ear.** The mechanism is correct and sourced, the arithmetic
is right, and whether a 4× gain in sequence is worth a note in eleven is not a
question a measurement can answer. `theme.sequence: [0, 0]` turns it off.

### And the wide defaults are now visibly too wide

`lofi seed 12` composes `S17 + S17 + A + A↓ + S4` where cell A is a **single note
of length 13** — a legal formula, both laws satisfied, and a lead of one note.
Near-empty lines already existed before this section (1 record of 159); the
stream shift made it 2, one of them a single note.

This is not a defect in the laws. It is what **"the widest range the law allows"
actually sounds like** when every one of the thirteen dials is at its default,
and it is the clearest argument yet for the standing work: **no genre declares a
single dial.** The engine can now express far more than any genre has asked it
for.

---

## 22. MELODIC TRANSFORMATION IS NOT A GENRE FACT

*2026-08-31. This section reverses a direction this file was about to take, and
it reverses it because the owner stopped it:*

> "I think your all WRONG! I think you can find a song in any genre that does
> just about anything with its melodic transformations. That is NOT a genre
> determinate. Prove me wrong! Music is an art defined by mathematical
> constraints that are creatively broken. No genre exsist is someone did not
> break the rules. Lofi hip hop is hip hop drums over jazzy chords with an
> average of a slow BPM"

### 22a. What was about to happen

§20 recorded that on four of the six melodic dials, the separation *between*
genres was 0.07–0.23 of the spread *within* a genre. That was written down as a
defect with a number to move, and three research agents were sent to move it —
one per genre — to find sourced ranges for the thirteen dials so that lofi,
synthwave and dungeon synth would finally measure differently.

All three came back. Between them they proposed twenty-three declarations. Not
one of them has been applied, and this section is why.

### 22b. The refutation was already in this file

§16 compares three songs and every row disagrees:

| | Chop Suey | Televators |
|---|---|---|
| what is kept | rhythm | **pitches** |
| what moves | key | **rhythm** |
| fixed grid | yes, 32 | **none** |
| repeated pitch | nine in a row | **none** |

Chop Suey and Televators are 2001 and 2003, the same scene, the same shelf.
They are opposite on `keep`, which is the single largest melodic dial. If two
neighbours inside one genre disagree on it completely, the genre is not what
sets it. §16 was written to kill the claim that *one* song is a fact; it also
kills the claim that a *genre* is one, and that half went unnoticed for a week.

### 22c. What the three agents actually found

Read as evidence rather than as answers, the three reports argue for the
owner's position, not against it:

1. **The sources are how-to posts.** "How to make synthwave melodies in
   Ableton", "Making dungeon synth without perfectionism". These are one
   person's advice on one way to do it — an example, which §16 already ruled is
   not a fact. They are not measurements of what the genre's records do.
2. **Every genre contradicted itself.** Dungeon synth: `dungeon-synth-
   critique.md` says *"the naive repeat is the genre"*; `dungeon-synth-
   technique.md` carries the owner saying *"We dont want the same repetitve
   Mortis type music"*. Lofi: `GENRE.lofi.theme` says the wandering is *"lofi
   being lofi"*; §6 of this file calls the same behaviour *"pure dice"*. Three
   agents, three genres, three internal contradictions, all self-reported.
3. **Every agent left three or four dials wide** because nothing anywhere spoke
   to them — `stated` and `restLen` in all three cases.
4. **One proposal was flagged by its own author** as arriving at the shape of
   the `[0.55,0.95]` default that §16 deleted for being Chop Suey and
   Televators. Different route, same numbers, which is what it looks like when
   a taste is being rediscovered rather than a fact found.

### 22d. The one real counter-argument, and why it does not carry

Large measured corpora *do* differ. Essen folk averages 2.8 semitones between
notes; Billboard pop 3.8 (§3a, §3b). That is real data over thousands of songs,
not a tutorial.

But the spread **inside** each corpus is far larger than the gap **between**
them. A corpus mean shifts an average; it does not tell any single song what to
do, and a Billboard song with folk-sized intervals is not rare, it is ordinary.
A weak shift in a distribution is precisely a **weight**, which is what the
owner already said a dial has to be, and it is nowhere near a genre rule.

### 22e. What this means for the architecture

The draw is three-level: **genre declares a range → the seed draws one value
per record → each restatement rolls against it.** The finding renames the
levels rather than breaking them.

> **The melodic-math dials belong to the SEED, not the genre.** Genre stays
> wide on them; the record picks the point. That is what the second level was
> built for.

The genre's identity is carried by the things the owner named — *"hip hop drums
over jazzy chords with an average of a slow BPM"*: kit, harmony, tempo, timbre,
form. Those live in other parts of the genre table, they already differ, and
none of them is a melodic transformation.

So §20's number is **not a defect and there is nothing to move.** Genres
measuring alike on `keep`, `close`, `devices` and `sequence` is the correct
result. Pasting the twenty-three proposals would have bought between-genre
separation at the price of within-genre separation: every lofi record holding
its rhythm, every dungeon synth record restating literally, on the authority of
a blog post. That is a narrower engine, not a better one.

**Anything that narrows a melodic dial now needs a reason that is not a genre.**
Two qualify, and both point the same way — *widen where the engine is narrower
than all music; fix the arithmetic where the numbers cannot work.*

### 22f. What survived: the arithmetic (built, §23)

Two agents independently found, and measurement confirmed, that the cell draw
could not produce the note count any genre declared. That is not a genre claim
at all — it is true in every genre and it was true before any of this research
started. Built; see §23.

### 22g. What survived: the engine is more inertial than all music

§3b measured the default `moves` table at **78% directional inertia** — a
movement following the one before it — against Essen folk 71%, Rolling Stone
48%, Billboard 43%. The engine is not writing one genre. It is narrower than
**every corpus ever measured**, folk included.

That is an engine defect by the owner's own standard, and the fix runs toward
wide rather than toward any genre. **Not built.** It needs the ear, because
widening the movement pool changes every line in the program.

### 22h. What survived: three citations that are wrong regardless

Found by the agents, independent of who is right about genre:

- `GENRE.lofi.theme`'s `moves` justifies its ±3/±4 tail in its own comment by
  citing **doc 003, a Zelda analysis** — video game music, cited in a lofi
  table. The +1/−1 asymmetry (10 against 8) has no source at all.
  **⚠ The first half of this is wrong — see §25.** The agent's objection was a
  genre mismatch; doc 003 is not a genre document. The real defect is different
  and worse. The asymmetry finding stands.
- `GENRE.dungeonsynth.theme`'s `moves` comment claims *"about three draws in
  four are a step"*; the pool computes **20/31 = 64.5%**.
- `lofi.md`'s `cadence: "none"` rests on one album, *Modal Soul* — the
  single-record defect this repo has now shipped seven times.

**Not fixed.** They are comment-and-provenance repairs, not number changes, and
they should not be bundled with a behaviour change.

---

## 23. THE CELL WAS DRAWN AND THEN CUT

*2026-08-31. The one thing §22 left standing, built the same day.*

### 23a. The bug

`INV` drew a cell's lengths free of the cap and then ran:

```js
while(lengths.reduce((a,z) => a+z, 0) > cap && lengths.length > 1){
  lengths.pop(); moves.pop();
}
```

Two things wrong with it. It is a **correcting pass**, which this file's house
rules forbid — the draw is supposed to be legal by construction, the way L2 and
L4 were made legal in §20. And the arithmetic made it fire on nearly every
cell.

The default length pool was **every whole number from 1 to `cap`, flat**. §17
called that "the widest the law allows". It is not. A flat pool over `1..cap`
has a **mean of half the cap**, so two notes already overflow and the loop
cuts. Measured over 40,000 cells:

| span | cellMax | count asked | notes actually kept |
|---|---|---|---|
| 64 | 0.35 | 4–5 | **1.66** |
| 64 | 0.20 | 4–5 | **1.61** |
| 32 | 0.35 | 4–5 | **1.60** |

**Every genre's declared note count was dead on arrival.** Raising `cellMax`
does not help — the pool grows with the cap, so the ratio is pinned near 1.6
whatever a genre asks for. Dungeon synth's `count.hooky: [4,2]` was set by
*measuring this program's own output* and raised deliberately; this loop threw
that measurement away every time, silently, and the printout showed the count
dial sitting there looking obeyed.

`1..cap` was never the widest legal default. **It was a one-note default.**

### 23b. The fix, both halves arithmetic

**Each length is drawn from the part of the pool that still fits**, leaving one
sixteenth for every note not yet placed. The cell comes out at exactly the
count the dial asked for, never over cap, and no note is discarded. The lengths
are then **shuffled** — the room shrinks as the cell fills, which front-loads
the long notes, and the constraint has no opinion about order.

**The default pool is sized to the count it is handed**: flat `1..2·cap/n − 1`,
whose mean is `cap/n`, so n of them average out at the cap. Notes forced down
to a single sixteenth because the room ran out rather than because the pool
drew one: **29% → 16%**, against the 10% the pool gives on its own. The last
six points are the cap doing its job.

A declared `theme.lengths` is used **exactly as declared** — the sizing is the
default's business only.

**Nothing legal became unreachable.** A cell of n notes can never contain a
length above `cap − (n−1)`, whatever pool it comes from; the values that left
the default were the arithmetically impossible ones. A one-note cell still
reaches the whole cap.

### 23c. Measured

| | before | after |
|---|---|---|
| mean notes per cell (704 cells, 4 genres, 10 seeds) | **1.47** | **3.22** |
| cells over cap | — | **0** |
| sheet motifs read back unchanged | 31/31 | 31/31 |
| records printing without error | 32/32 | 32/32 |

In the printout, dungeon synth seed 7's hook went from cells reading `15+1`
and `2+14` to `1+3+2+2+4`, `1+2+1+5` and `1+4+3+3+2`. Lofi seed 12's went to
`6+2+2+3`, `1+2+5+4`, `2+2+2+4`. The count dials that four genres declared are
now actually spent.

### 23d. Still open, and visible in the same printout

Not touched, because they are separate and because §22 says a genre is not the
reason to touch them:

- **`restLen` at the wide default is extreme.** Lofi seed 12 declared `C + S50
  + C↓` — fifty of sixty-four sixteenths as one silence. The law permits it and
  no source in the repo measures rest *length* in any genre. It needs the ear,
  not research.
- **Two-note cells are still lopsided** (`15+1`). That is a flat pool being
  flat, not the squeeze, and it is legal music.
- §22g's inertia finding, and §22h's three bad citations.

---

## 24. WHY WAS THERE A BAKED-IN DEFAULT AT ALL?

*2026-08-31, the owner, one hour after §23 shipped:*

> "Why is there a baked in default at all?"

### 24a. The answer is that I orphaned the genre's own declaration and then filled the hole with a number

Three genres declare **`onsetPool`** — where in the bar a note starts, weighted,
sourced, and argued over in its own comment: *"nothing here is a list of
nice-sounding steps — it is one ordering, derived, and every genre's pool is the
same ordering with its own accents on top."*

**Where the notes start and how long they are is one fact.** The gaps between
onsets *are* the lengths. And `onsetPool` was live code until `c5093e6` — this
session's own *"a cell is a length, not a bar"* — where a cell was built by
drawing its notes straight out of it:

```js
const pool = onsetPool.slice(), st = [];
while(st.length < n && pool.length){ ... }
```

Rebuilding the cell as a run of lengths was right; the notation *is* lengths.
**Dropping the genre's declaration instead of converting it was not.**
`onsetPool` has been assigned-and-never-read ever since — four mentions in the
whole file, three declarations and one dead `const`. Lofi's `breathLast: 7` died
the same day and now exists only *inside a comment describing what it does*.

So the default was never filling a gap in what the genre had said. **It was
overruling it with a number nobody sourced.**

### 24b. And "flat" is not the absence of an opinion

A default feels safe because it looks like neutrality. It is not neutral, and it
is the most powerful value in the program: a declared number gets argued with,
a default gets inherited in silence by everything that did not speak.

Flat over `1..M` says a **seven**-sixteenth note is exactly as likely as a
**four**. No music does that — meter makes 2, 4 and 8 common and 7 rare.
Uniform over something that is not uniform is a bias with the lights off. This
is the same defect as the seven song-traceable defaults §16–§17 removed, wearing
better clothes.

### 24c. Built: the lengths are read off the genre's own onsets

The pool is tiled across the cell's window (a cell crosses bar lines; the pool
is one bar), **n+1** seats are drawn from it without replacement exactly as the
old code drew them, sorted, and the gaps between them are the cell's lengths —
the last seat being where the cell stops.

No transform, no fitted distribution, no invented weight, no correcting pass.
The count is exact; the span cannot exceed the cap because the window *is* the
cap. A declared `theme.lengths` still wins outright.

**A derived table was tried first and is wrong — recorded so nobody rebuilds
it.** Weighting each length by `w[a]·w[b]` over every pair of onset positions
gives dungeon synth a mean length of **8.0** against the true **4.0**, and puts
its heaviest weight on 8 where the truth is 2. It counts gaps that another onset
falls inside.

### 24d. Measured

All four genres in this file declare or inherit an `onsetPool`, **so the flat
pool is now unreachable.** It is kept only because a genre is allowed to declare
neither, and it is labelled for what it is: the maximum-entropy answer for a
table that has said nothing, not a statement about music.

Where the lengths land, 10 seeds a genre, as a share of all lengths drawn:

| | 1 | 2 | 4 | 8 | 5 | 7 | 9 | 13 |
|---|---|---|---|---|---|---|---|---|
| lofi | 223 | 201 | 135 | 40 | 40 | 17 | 25 | 7 |
| dungeonsynth | 232 | 192 | 89 | 62 | **6** | 14 | **3** | **1** |

Both now weight the beat grid. **And they differ from each other** — dungeon
synth's odd lengths are near-absent because its declared pool has no seats at
all on 1, 5, 9 and 13, where lofi's pool seats every sixteenth. That is a real
between-genre difference produced by a sourced declaration rather than an
invented one.

It is worth naming what kind of difference it is: **rhythm, not melodic
transformation** — which is exactly where §22 says a genre lives.

Unchanged by this: mean notes per cell **3.21** (710 cells, 4 genres, 10 seeds),
all 31 sheet motifs read back identical, 32 records print clean, no cell over
cap.

### 24e. Still dead, and not fixed here

**`breathLast`** — lofi declares `breathLast: 7`, which was *"the last sixteenth
a breath bar may put an onset on"*, and it died in the same commit. Nothing
reads it. The mechanism it belonged to (a phrase's second bar drawing fewer
notes and stopping early) has no equivalent in the cell engine yet, so reviving
it is a design question, not a repair.

**The general lesson, which this file should stop having to relearn:** when a
mechanism is replaced, the genre declarations feeding the old one are not
leftovers to delete — they are the sourced part, and they are the half worth
keeping. The code is the disposable half.

---

## 25. THE ZELDA CITATION — I WAS WRONG ABOUT WHY IT WAS WRONG

*2026-08-31. The owner, after §22h flagged lofi's `moves` for citing a "Zelda
analysis":*

> "Did you find the doc the zelda citation is from? It is in the main branch.
> It is not about Zelda is it?"

I had not found it. I passed on a research agent's flag without opening the
file. Opening it corrects me twice.

### 25a. Doc 003 is not a genre document

It is `003 (Transitions)` in `main`, and it is one of the owner's **nine
numbered craft transcripts**. Not one of them is about a genre:

| | |
|---|---|
| 001, 008, 009 | turning a loop into a finished song |
| 002, 007 (structure) | song structure and form |
| 004 (Drums) | rhythm — the syncopation hierarchy this file's `onsetPool` is built on |
| 005 (loops) | arrangement |
| 006 (rule of 3) | the rule of three |
| 007 (8bar) | escaping the eight-bar loop |
| **003 (Transitions)** | **how one musical idea becomes the next** |

The owner filed 003 as **Transitions**. Its thesis sentence is:

> "Each phrase takes the last piece of the melody and adds something to it or
> twists it in a new way, giving the melody a **step-by-step progression from
> each bar to the next**."

That is this engine's entire subject, stated generally. **Zelda is the worked
example, not the topic.** So the objection in §22h — *"VGM, not lofi"* — is a
category error. Citing doc 003 in a lofi table is not a genre mismatch, and the
agent's flag and my repetition of it were both wrong.

### 25b. The real defect is worse, and it is the familiar one

What the code actually took from it was:

> "THE ZELDA ANALYSIS IN doc 003 IS THE MODEL"

— and it derived a pitch pool for a whole genre from **one piece of music**:
the root-and-fifth skeleton with a scale run filling the gap. That is the
single-record defect this file has now shipped eight times.

**And the source says so itself,** in a sentence the comment did not quote:

> "The structure of **this melody is totally unique compared to most game
> music**."

The engine took as its model a tune its own source calls unique.

### 25c. The tell was the name

The comment called it *"the Zelda analysis"*. The owner filed it as
*"Transitions"*.

**Naming a document by its example instead of its subject is the mechanism by
which an example becomes a rule** — and here the mechanism is visible in the
citation itself, which is why the citation read as a genre error to an auditor
and as a licence to copy one melody to whoever wrote it. [owner:] *"an EXAMPLE
is not a fact in of itself it is generally just ONE way to do many things."*

### 25d. Fixed, with no number touched

Both citations of doc 003 now name it as `"Transitions"`, a craft transcript,
with a note not to read it as a genre document.

**Lofi's pool is re-grounded on the general claim that was already in the same
comment** — a melody is predominantly stepwise with leaps as the *structural*
events, *"the most compelling melodies employ both conjunct and disjunct
motion"*. That is a claim about melody rather than about one tune, and it
carries the same numbers on its own. The leaps stay; the tune they were copied
from does not.

**Dungeon synth's pool never needed the doc.** It stands on a measurement — the
lead used seven distinct pitches in a ten-minute record — and on the genre's own
open-fifth harmony. Its citation is downgraded to a pointer.

Comments only: `mk2_score.js` for lofi seed 12 hashes identically before and
after. **No note moved.**

### 25e. What doc 003 does support, and is worth spending properly

Its definition of **sequence**, which it attributes to the classical repertoire
and not to Zelda:

> "Taking a melodic idea and moving it down a scale in steps is called a
> sequence. And it's a very classical technique. **You won't hear a Mozart piece
> that doesn't move a melody around in sequence at least once.**"

That is a general claim about melody and a legitimate source for the `sequence`
dial built in §21, which currently has none.

### 25f. The lesson, which is about how I audit

Three agents produced twenty-three findings. I checked the arithmetic ones by
measuring them myself and they held. **I passed on the citation one without
opening the document**, and it was wrong in a way that would have sent the next
reader to delete a good source. A provenance claim is checkable in one command;
there is no excuse for relaying one.

---

## 26. A REGRESSION I SHIPPED, AND THE BUG UNDER IT

*2026-08-31. Found while measuring melodic direction, not while looking for it.*

### 26a. What broke

§24's change — lengths read off the genre's own onsets — moved the dice, and two
records stopped composing:

| | before §24 | after §24 | now |
|---|---|---|---|
| records that will not compose (240) | **1** | **3** | **1** |

The one that remains was already there and is not the tune's (§26d).

**My sweep missed it, and the harness did not.** `mk2_score.js` printed
*"✗ 1 of them the program could not make"* and my grep pattern looked for
`error|cannot read|NaN`. The tool said the right thing and the test around it
was wrong.

### 26b. The bug was not in the cell engine

The failing note was `lead 78 bar 3` — F#5 in **G phrygian** over a Bb–D–F
chord. F# is not in the mode and not in the chord, and the note after it was Ab:
in the mode, but not in the chord, so the law's second clause could not save it
either.

Tracing it, the tune's own note chooser never wrote F# at all — it wrote G, then
Ab. **The F# was inserted afterwards by the Landini cadence**, the figure that
makes an ending sound medieval by dropping the leading tone to the sixth before
leaping to the final.

And that figure chose its note like this:

```js
const SC = MODES[mode] || [];              // the SONG's mode
if(SC.includes((((cand - root) % 12) + 12) % 12)) six = cand;   // the SONG's root
```

**It asked the record's opening key.** Every other pitch in that function is
placed with `keyOf(chordSet)` / `modeOf(chordSet)` — the key the *material* is
actually in. Where a section had moved key, the cadence note was drawn from a
scale the music had left.

This is the exact failure the seam check's own comment predicts:

> "THIS IS ALSO THE CHECK THAT CATCHES A PART LEFT BEHIND. If a section changes
> key and some part does not come with it, that part's notes are now out of the
> section's scale and this throws."

A part was left behind. It was one *figure inside* a part.

### 26c. Fixed, and the blast radius is exactly the bug

`LK = keyOf(chordSet)`, `LM = modeOf(chordSet)`. Not a new rule and not a wider
one — the figure's own comment already said *"it is refused if the sixth is not
in the mode"*; it is now asked about the mode it is in.

Over 240 records, hashing every note's role, pitch and time:

> **2 of 240 changed — dungeon synth seed 55 and ds2 seed 55, both from "would
> not compose" to composing. Every other record is byte-identical.**

600 records now compose with one failure, and that one is §26d.

**Two guesses were tried first and are recorded as guesses, not fixes.** I
patched the note chooser twice — first requiring a hanging dissonance to resolve
onto a chord tone, then refusing an unresolvable dissonance at the point of
choice — and re-measured: **3 failures, unchanged.** Both were reverted, because
the tune's chooser was never writing the note. Neither patch was wrong about the
law; both were wrong about where the note came from, and a patch that does not
move the number is not a fix.

### 26d. The one that was already broken, diagnosed and not fixed

`lofi seed 17`, material Bdev: **`keys2`, not the tune.** Pitch 82 (B♭) over a
chord whose `tones` are A, C, E, G, resolving to C ten semitones away.

The pitch comes from `voiced[v]` — the comp's own voicing. So **the voicer is
playing a pitch that the chord object's `tones` array does not contain**, and
the law reads `tones`. That is a disagreement between the voicer and the chord
about what the chord is, in the comp, and it has nothing to do with the melodic
math engine. Recorded here so it is not lost; it belongs to whoever works on the
comp next.
