# BOXCAR SYNTH — THE MISSING HOOK, `2026-08-17`

*The owner: "Print the midi notes and read them! Do this for a dozen random
seeds the whole song. I think an issue is not having a hook. That thing the
song is evolving towards. No motif."*

**They are right, and the notes say exactly where it went.** Twelve seeds,
every material, printed and read.

The short version: **the program DOES write a hook. It writes one in the
chorus, and the chorus is 14% of the record — the lowest share of any genre —
and you do not hear it for the first time until four minutes in. The other 86%
of the record is a tune that never repeats itself.**

---

## 1. ONE STATEMENT OF THE TUNE TAKES 27 SECONDS

| genre | bpm | material bars | one statement of the tune |
|---|---|---|---|
| synthwave | 111 | 4 | 8.7 s |
| vgm | 102 | 4 | 9.8 s |
| lofi | 77 | 4 | 12.5 s |
| dungeonsynth | 65 | 4 | 15.1 s |
| **boxcarsynth** | **72** | **8** | **27.1 s** |

**Three times longer than any other genre.** A hook is a thing you can hold in
your head — a bar or two, a few seconds. This tune takes half a minute to say
once, and then says something else.

The cause is one table line: **`materialBars: 8`. Boxcar synth is the only
genre in the file that declares it**; every other genre takes the default 4.

---

## 2. THE VERSE TUNE NEVER REPEATS ITSELF. THE CHORUS TUNE ALWAYS DOES.

For each material, the smallest number of bars after which the lead's content
comes back. If nothing shorter repeats, the answer is the whole material.

| material | n | notes | mean cell | **repeats inside itself** | share of record |
|---|---|---|---|---|---|
| A | 12 | 10 | 27.1 s | **0 of 12** | ⎫ |
| Avar | 12 | 11 | 27.1 s | **0 of 12** | ⎬ **86%** |
| C | 12 | 14 | 27.1 s | **0 of 12** | ⎭ |
| **B** | 12 | 13 | **16.7 s** | **6 of 12** | ⎫ **14%** |
| Bvar | 12 | 18 | 27.1 s | 0 of 12 | ⎭ |

Every other genre: **12 of 24** materials contain a repeating cell.
Boxcar: **6 of 24**, and all six are the chorus.

---

## 3. THE NOTES, PRINTED — the hook is real and it is in B

The chorus material, read straight off four seeds. `*` is a strike, `-` is the
note still sounding, `.` is silence. Each block is one bar.

**Seed 5 — F# minor, 74 bpm**
```
B    ....*---*---*--. ....*---........ ....*---*---*--. ....*---........
     ....*---*---*--. ....*---........ ....*---*---*--. ....*---........
     G#5 G#5 G#5 B4   G#5 G#5 G#5 B4   G#5 G#5 G#5 B4   G#5 G#5 G#5 B4
```
**A two-bar cell, stated four times. That is a hook.**

**Seed 9 — F# dorian, 64 bpm**
```
B    *-------*---*--. ....*---........   ×4
     F#5 E5 D#5 A4                       ×4
```

**Seed 10 — F dorian, 78 bpm**
```
B    *-------*---*--. ....*---*---....   ×4
     F5 D#5 D5 C5 C5                     ×4
```

**Seed 12 — B mixolydian, 81 bpm**
```
B    ........*---*--. *-------........   ×4
     D#5 C#5 G#4                         ×4
```

Now the same seeds' **verse** material — the 86%:

```
seed 5   A  *---............ ........*---.... *-------*--..... ....*---........
            *-------*--..... *---............ *---............ ................
            B4 A4 B4 C#5 G#4 A4 A4 A4 F#4

seed 9   A  *---............ ................ *-------*--..... *---............
            *---............ ................ *---*--......... *---............
            B4 A4 B4 B4 A4 G#4 A4 B4

seed 10  A  *---............ ........*---.... *-------........ *---............
            *-------*--..... *---............ *-----------*--. ............*---
            G5 C5 A#4 A#4 D#5 F5 D5 G4 G#4 A#4

seed 12  A  ....*-------*--. ........*---.... *-------*--..... *---............
            *-------*--..... ............*--- *---*--......... *---............
            B4 C#5 F#4 C#5 D#5 C#5 D#5 D#5 D#5 A4 G#4 A4
```

**Eight bars, nine to twelve notes, and no bar is ever like another bar.** Every
rhythm is different, every pitch group is new. There is nothing here to
recognise, because nothing here comes back.

---

## 4. IT KEEPS SAYING NEW THINGS — measured

Four notes is about a hook-sized unit. Over whole records, 6 seeds:

| genre | lead notes | **distinct 4-note figures** | most-heard one | **its share of the line** |
|---|---|---|---|---|
| dungeonsynth | 163 | **39** | 18.0× | **12.2%** |
| lofi | 122 | 49 | 8.7× | 7.2% |
| synthwave | 287 | 65 | 18.5× | 6.4% |
| vgm | 141 | 52 | 7.3× | 5.3% |
| **boxcarsynth** | 178 | **83** | 8.8× | **5.1%** |

**The most distinct melodic material of any genre and the least repetition of
any genre.** Dungeon synth uses 39 figures and leans on one of them for an
eighth of its line; boxcar uses 83 and leans on nothing.

---

## 5. AND THE HOOK ARRIVES FOUR MINUTES IN

| genre | record | **first chorus** | choruses | **share of record** |
|---|---|---|---|---|
| lofi | 2.7 min | 48 s | 2.5 | **39%** |
| synthwave | 4.2 min | 72 s | 3.7 | 26% |
| vgm | 3.2 min | 64 s | 2.8 | 29% |
| dungeonsynth | 10.2 min | 309 s | 2.5 | 25% |
| **boxcarsynth** | 9.8 min | **253 s** | 3.0 | **14%** |

Four minutes and thirteen seconds of a ten-minute record before the one thing
that repeats is heard at all — and then it is a seventh of the record. Dungeon
synth waits even longer but gives you 25% when it arrives, and dungeon synth is
a genre whose whole argument is that it does not have hooks. Boxcar waits like
dungeon synth and pays out like nothing at all.

---

## 6. HOW THIS HAPPENED — and it was a fix

This is worth writing down because the cause was a correct decision.

At `2026-08-16`, two things landed together:

1. **`materialBars: 8`** — because "a 20-minute record composed the same ~40
   bars as a six-minute one". A real complaint, correctly fixed.
2. **The theme builder learned to span the full `materialBars`.** Before that,
   the file's own comment records the defect: *"`phrase()` spans exactly two
   bars, and both roads through this function call it twice — question and
   answer, or **the hook and its copy**. That was invisible while every genre
   had `materialBars: 4`… The genres that ask for EIGHT got a tune across the
   first half and silence across the second."*

Read those together. At four bars, the builder wrote **a two-bar idea and then
its copy** — a hook by construction. The `materialBars: 8` fix made the tune
fill all eight bars, which removed the silence *and removed the copy*. Eight
bars of continuous new material instead of a four-bar idea stated twice.

**The repair for "too repetitive" produced "no motif."** Both complaints are
correct and they are the same dial pulled in opposite directions.

*(This is the reading of the mechanism that the comments and the measurements
support. It has not been proven by reverting the change and re-measuring, which
is what would settle it.)*

---

## 7. WHAT WOULD FIX IT

The answer is not to put `materialBars` back to 4 — that would restore the
complaint it was raised to fix.

**Give material A the structure material B already has: an idea and its
restatement.** Eight bars is enough room for a two-bar cell stated twice, then
answered, then stated again — the shape B gets for free and A never gets. The
engine can already do it; B is the proof, printed above in four seeds.

Concretely, in rough order of value:

1. **A hook and its copy inside the verse.** Declare the tune's phrase
   structure rather than letting eight bars be filled continuously. Bars 1–2
   restated at bars 3–4, or 1–4 restated at 5–8 with a changed tail — which is
   what `Avar` already does at the *material* level and nothing does at the
   *bar* level.
2. **Bring the chorus forward and give it more of the record.** 14% and a
   253-second wait is the lowest and latest in the file.
3. **A step budget on the tune** (from the second audit): 68% stepwise, the
   lowest of the five genres. A tune that leaps is harder to remember, which
   compounds everything above.
4. **A guard.** Nothing in the battery asks whether a genre's tune repeats
   inside itself. `probe_repetition.js` measures what comes back at the
   *section* level and would have called this record varied. A check that asks
   "does the lead contain a cell shorter than the material" would have caught
   this the day it landed.

---

## APPENDIX — the twelve seeds, verse material

```
 1  C# dorian 74  D#5 E5 C#5 D#5 A#4 D#5 E5 D#5 A#4
 2  D  dorian 66  G5 A5 G4 D5 C5 D5 C5 D5 B4 F5 G5 D5
 3  C  dorian 60  D5 D5 D5 D#5 D5 D#5 F5 D#5 C5 C5 C5
 4  (A#) 
 5  F# minor 74  B4 A4 B4 C#5 G#4 A4 A4 A4 F#4
 6  G  mixo   60  A4 G4 G4 E5 A4 A4 B4 C5 D5 D5 D5
 7  F  dorian 58  A#4 F4 A#4 C5 G#4 G4 G#4 G4 F4
 8  A  mixo   87  D5 D5 F#4 G4 A4 G4 E4 B4 A4
 9  F# dorian 64  B4 A4 B4 B4 A4 G#4 A4 B4
10  F  dorian 78  G5 C5 A#4 A#4 D#5 F5 D5 G4 G#4 A#4
11  E  dorian 84  A4 G4 B4 F#5 G5 C#5 F#5 G5 B4 A4 G4 A4
12  B  mixo   81  B4 C#5 F#4 C#5 D#5 C#5 D#5 D#5 D#5 A4 G#4 A4
```

Nine to twelve notes, spread over twenty-two to thirty-three seconds, and not
one of them contains a figure that comes back.
