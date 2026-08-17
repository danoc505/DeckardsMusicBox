# THE HEAD AND THE BAND — why the record had no motif, `2026-08-17`

> *"The worst thing is its just random notes with instruments being played wrong
> we have no motif no repeating patterns no rule of three. Its just bad! I cant
> even listen to a whole song there is nothing to listen to."* — the owner

Two sessions were spent on the tune's **intervals** on the theory that the line
wobbles. It does wobble, and that was not the fault. This sheet records the
measurement that found the real one, the two candidate fixes that were built and
**measured as doing nothing**, and what the fix actually was.

---

## 1. THE FIRST TWO ANSWERS WERE WRONG, AND THEY WERE MEASURED WRONG

Measured over 40 records, the drawn phrase only — bars 0–1, which is all
`buildTheme` writes; everything after is a copy:

```
   ±2 semitones (one whole scale step)   51.2% of every interval
   steps (1–2)  73.9%      leaps (3+)  26.1%
   A-B-A returns  32.0%
   same-direction runs of length 1  71.0%   ← the line turns round after almost every note
```

That is a real description of a shapeless line, and it produced two theories:

1. **The palette cannot leap.** `theme.moves` exists precisely to fix this, its
   comment says the largest interval expressible anywhere in the program was a
   third — and **no genre in the file declares it**. Dead config.
2. **The tune never aims at a chord tone.** The melody-target rule (strong beats
   and long notes prefer chord tones, 84.1% in two corpora
   [`sax-material.md`]) is gated on `INSTRUMENTS[lead].lines`, which only the
   sampled winds declare. A fiddle never gets it, so 63.4% of the tune's notes
   are dissonances, and a hanging dissonance **forces the next move to exactly
   one scale step** — which is where the wobble comes from.

Both were built and A/B'd:

| | ±2 share | steps | A-B-A | run-of-1 |
|---|---|---|---|---|
| baseline | 51.2% | 73.9% | 32.0% | 71.0% |
| + chord-tone targeting | 49.5% | 73.7% | 32.7% | 69.6% |
| + targeting + an interval budget with fourths and fifths | 44.8% | 72.8% | **38.3%** | **75.4%** |

**Neither moved anything, and the second made the contour worse.** Both were
thrown away. The chain of causation was correct and the conclusion drawn from it
was not, which is this repo's most common failure and is why the arms get built
before they get believed.

---

## 2. WHAT IT ACTUALLY WAS — the tune was being redrawn every eight bars

Printed, seed 1, `materials.takes["A|lead"]`:

```
take 0   D#5 C#5 D#5 C#5 G#4        stated twice — a hook
take 1   E5 F#5 G#5 A#5 G#5 F#5 G#5 F#5
take 2   D#5 E5 F#5 E5 F#5 B4 A#4 F#4 E4 C#5
take 3   F#5 C#5 F#5 G#5 A#5 B4
```

**Four different melodies, not four performances of one.** Different contours,
different registers, different lengths. `makePerformance` plays
`cycle % takes.length`, so the hook a listener has just learned is replaced by a
different hook eight bars later, for twenty minutes.

There is nothing wrong with any one of those four tunes and there is no record in
which all four are the same tune.

### 2a. And the program argued against this in its own comment

At the takes machinery, written when the feature was built:

> **"WHY THE FIGURE FIRST, and not the tune: the tune is the HEAD. A head that
> never returns is not a tune, and modal jazz keeps its head exactly because
> RECOGNITION IS HALF OF THE MUSIC. The rhythm section is the half that must
> never repeat."**

The genre table then declared `lead: 4, counter: 4`. The reasoning and the
configuration were written in the same session and disagree.

`counter` was not a second loss: `counterATakes` is derived take-for-take **from**
the lead's takes, so with one head there is one shadow and that entry could never
have been reached. It is removed rather than left sitting, per the file's own rule
against dead config.

---

## 3. AND MOST OF THE RECORD HAD NO HOOK BECAUSE NOBODY ASKED IT TO

Material share of playing time, 8 seeds:

| material | share | had a repeating cell? |
|---|---|---|
| **C** (the bridge) | **26.7%** | no — the augmentation road |
| **Avarlift** | **24.8%** | no — built from a non-hooky tail |
| **Avar** | **18.3%** | no — built from a non-hooky tail |
| A | 17.3% | **yes** — `verseHook`, since `2026-08-17` |
| B | 6.9% | **yes** |
| Bvar | 5.6% | **yes** — `varTailB` has carried `hooky: true` since it was written |

**69.8% of the record was material whose tune has no internal repetition.**

`boxcar-the-missing-hook.md` measured exactly this fault on A, and `verseHook`
fixed it — **for A only**. Nobody asked the same question of the material A turns
into, which the record plays more than A itself. Three call sites now pass the
same declaration: `varTail`, `varTaill` and `themeAl`.

---

## 4. THE BRIDGE PROMISED "THE SAME SHAPE" AND THREW THE SHAPE AWAY

C is the largest single material in the record and takes the `augmentOf` road,
whose comment reads *"A's rhythm AUGMENTED — every duration doubled, so half the
density **at the same shape**"*. The rhythm was A's. The pitches were:

```js
const step = wpick(rng, [[1, 2], [-1, 3], [0, 2]]);   // a random one-step walk
```

An augmentation whose pitches are redrawn is not an augmentation. The sources are
unambiguous that a derivation keeps the motive: *"preserve the identity of the
motive while adding variety"* [corpus:vaia, via `development.md` §4].

### 4a. Feeding A's intervals in did nothing, and the reason was the snap

First attempt: replace the draw with A's own interval, counted in scale steps.
Measured — **52.8% contour agreement before, 53.3% after.** Chance, for a binary
up/down. Instrumented at the site:

```
   asked for a move, got the same direction    90/620    14.5%
   THE SNAP FLATTENED IT TO ZERO              429/620    69.2%
```

`nearestTone` takes the nearest of a bridge chord's three or four tones, so seven
moves in ten land back on the note they left. **The branch's own comment already
said so** — *"consecutive notes over one chord snap to the same tone, which is
where this branch's repeats came from"* — and answered it by walking further
afterwards, which treats the symptom.

A scale step cannot leave the key, so the snap is not what keeps this branch
diatonic; `scaleStep` is. What the snap bought was chord tones, and the price was
the tune. With it removed for a genre that asks:

```
   asked for a move, got the same direction    92.6%    (the 7.4% is intoBand folding at the band edge)
   flattened to zero                            0.0%
```

Printed, seed 2 — A is `G5 A5 | C5 B4 A4`, and C's first four bars are now

```
   G4 A4 C5 | A#4 A4 | G4 A4 | C5 A#4
```

the same tune, at half speed, an octave down, over the departure's changes. That
is what a bridge is.

---

## 5. AND A COPY NOTHING VARIED IS THE LOOP THE GUARD FORBIDS

`probe_develop.js` was red at **1/59** before any of this work and had been for
some time — a pre-existing fault reported here rather than quietly absorbed. Seed
58, 28 notes across eight bars, dense enough that no device and no setting had a
free seat for **every** note, so the all-or-nothing test fell back to the plain
copy: bars 0–1 at 2–3 at 4–5 at 6–7. Periodic by construction.

§4b of `development.md` already widened the device parameters once (26 of 60 → 10)
and widening them again would move all 59 records that are fine to rescue one.
Instead the last note takes the `tail` device on its own, at the **same
permissiveness the copy was laid at** — per note rather than all-or-nothing —
which is why it succeeds where the device could not. No draw, so nothing moves
that was not already a plain copy. **1/59 → 0/59.**

---

## 6. WHAT IT MEASURES

Whole records, 8 seeds, distinct 4-note figures — the unit
`boxcar-the-missing-hook.md` §4 uses:

| | distinct figures | most-heard figure |
|---|---|---|
| before | 166 | 4.0% of the line |
| **after** | **96** | **5.5%** |
| dungeon synth, for scale [§4] | 39 | 12.2% |

A third of the record's melodic material was the head being re-drawn. It is gone.

**And this does not finish it.** 96 distinct figures is still two and a half times
dungeon synth's, because seven materials × eight bars is seven unrelated tunes,
and only C is now derived from A. The next lever is relating B and the lift to A
the way C now is — and that is a bigger change than this one, so it is written
down rather than started.

---

## 7. WHAT IS STILL WRONG, MEASURED AND NOT FIXED

- **The tune has four notes.** Mean 4.13 notes in the two-bar cell it draws
  3–4 per bar for, and **37.5% of cells have fewer than four**. Seed 3's material
  A is `D5 … C5` — two notes across eight bars. Of the drawn onsets, 14.8% are
  abandoned outright (resolution would leap 7.5%, no legal different pitch 4.3%,
  leap onto a clash 1.5%, seat taken 1.5%); the rest of the shortfall is the
  no-repeat and landing rules popping notes. **Task #135.**
- **The wobble is still there**, and §1 is the record of two answers to it that
  measured as nothing. It is a smaller fault than it looked, because a shape
  heard forty times a record beats a better shape heard once — but it is real.
- **C's rhythm is not A's rhythm.** `at = t * 2` accumulates source *durations*
  rather than doubling source *positions*, so the augmentation drifts and lands
  sparse at the front and dense at the back. Untouched here; the pitches were the
  motif question.
- **`mk2_test.js` crashes** composing genres deleted from the file — the same
  class as the faders probe, identical before and after this work. So does
  `probe_repetition.js`, which is fixed here (it now asks `M.genres()`).

## SOURCES

- `development.md` — the three devices, all-or-nothing, and the return/vary split
- `boxcar-the-missing-hook.md` §2, §4 — the distinct-figure measure and the
  reference numbers for the other genres
- `modal-jazz.md` §7e, §10 — the head returns; "breathe, repeat, vary, resolve"
- `sax-material.md` — strong-beat stability 84.1%, held-note stability 85.8%,
  two independent corpora, which is where the chord-tone targeting arm came from
- `lotr-themes-measured.md` §5.5 — "melody type is an interval budget", which is
  where the interval-budget arm came from
- [corpus:vaia] — "preserve the identity of the motive while adding variety"
