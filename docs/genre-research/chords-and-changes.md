# THE CHORDS, AND WHERE THE CHANGES ACTUALLY CHANGE — measured 2026-08-18

*Taken at the owner's direction: "Lets work on chords and chord progression
changes." This measures the harmony of whole records in all four genres first,
because two of the three things it found were not what I expected to find and
one of them is a genre that has never had a seventh chord in its life.*

---

## 1. THE HARMONY OF A WHOLE RECORD, MEASURED

Walking every section of every record and reading the chord set that section
actually plays. 24 records a genre.

```
  genre          distinct chords    of N bars    bars where     chorus chords ==
                 in a WHOLE record               the chord      the verse's
                                                 changes
  lofi                4.8              55           100%          24/24
  synthwave           3.8             116           100%          24/24
  dungeonsynth        3.7             163            59%           0/24
  boxcarsynth         6.8             179            64%           0/24
```

**A whole record contains between three and seven different chords.** Synthwave
is the extreme: **3.8 distinct chords across 116 bars.** A record is one
four-chord progression, plus a bridge — and only 2 of 24 synthwave forms, 7 of
24 lofi forms, contain a bridge at all.

**And for lofi and synthwave the chorus is harmonically nothing.** 24 records
out of 24, both genres, the chorus plays the verse's chords note for note. This
is item 3 of `the-nine-files-against-the-program.md`, confirmed by independent
measurement, and that sheet is right to call it the cheapest of its four: the
machinery is built and two genres already use it.

---

## 2. AND THEN THE CHORD QUALITIES, WHICH I DID NOT EXPECT

The same records, every chord in the verse, chorus and bridge sets:

```
  genre          notes in the chord                  quality
  lofi           4:38%  5:38%  3:13%  6:13%          plain 48% · min7 21% · dom7 19% · maj7 10%
  synthwave      3:100%                              plain 100%
  dungeonsynth   3:100%                              plain 100%
  boxcarsynth    3:100%                              plain 100%
```

**Three of the four genres have never produced a chord with four notes in it.**
Not rarely — never, in 360 chords each. Lofi declares `extensions` and
`qualities`; nothing else does, so every other genre gets `G.sevenths ? 4 : 3`,
and all three declare `sevenths: false`.

For dungeon synth that is **correct and sourced**, and this sheet does not touch
it: the medieval sources this genre was built from ask for triads, open fifths
and octaves, and `dungeon-synth-arrangement.md` already records the
voice-leading and pedal research that depends on them. A seventh chord is not a
thing that music has.

**For boxcar synth it is a defect, and nothing ever decided it.** `sevenths:
false` sits in the table with no comment and no source, and the genre's own
founding sheet `boxcar-synth.md` does not contain the word "seventh" anywhere.
It is a default that was never a decision.

---

## 3. WHAT THE SOURCES SAY BOXCAR'S CHORDS SHOULD BE

The genre is a jug band / hobo string band: washboard, washtub bass, banjo,
harmonica, fiddle. Its harmony is named precisely by its own practitioners:

> "You can play any **V chords as dominant 7ths**, and experiment with playing
> **I and IV chords as sevenths**, too." [corpus:arlotone, *Tips for Jug Band
> Jams*]

> "One frequently used progression in jug bands is the **VI-II-V-I** sequence.
> **The VI, II and V chords are usually played as 7ths.**" Named examples: *Rag
> Mama* (F), *Jug Band Waltz* (C), *I'm Satisfied With My Gal* (G).
> [corpus:arlotone, via search excerpt — the page itself returned HTTP 503 on
> fetch, so this is quoted from the indexed text and marked as such]

> The **ragtime progression** is "a chain of secondary dominants following the
> circle of fifths", named for its popularity in that genre.
> [corpus:wikipedia, *Ragtime progression*]

> What separates blues from standard major-key harmony is that **every chord is
> a dominant seventh, including the I chord**. [corpus:happybluesman]

**`[three sources, agreeing on the same chord]`** The dominant seventh is not a
colour in this music, it is the house chord — and this genre has produced
exactly zero of them.

### The one that is not a guess about mode

Boxcar draws **dorian 16, minor 9, mixolydian 5** of 30 records. In
**mixolydian, stacking one more third on the tonic gives a dominant seventh by
the scale itself** — the flat seventh is in the mode. So the `I7` that
arlotone's "experiment with playing I and IV chords as sevenths" describes is
not something that has to be imported into this program; it is what the mode
already contains and what `sevenths: false` has been refusing.

---

## 4. WHAT THE SOURCES SAY LOFI'S CHORUS SHOULD DO

> To make the chorus brighter, **modulate to the relative major** — "shifting to
> major chords like C, F, and G, which provide a bright and cheerful sound" —
> while the verse stays in minor for "a more reflective and emotional tone",
> and "the contrast between major and minor sections helps create emotional
> depth and variation throughout the track." [corpus:unison]

> "Consider incorporating **extended chords like D7 or Fmaj7 in the chorus** to
> create a sense of sophistication and warmth… evoking a sense of longing or
> tension." [corpus:unison]

> **Borrowed chords from parallel modes** "can create subtle but powerful
> changes in mood". [corpus:unison]

And this program's own note, written when `chorusProgressions` was built for
another genre, already states the case in its own words:

> *"B KEPT A'S BASS, A'S DRUMS AND A'S CHORDS — verbatim… so the only thing
> that ever changed between a verse and a chorus was the TUNE. In a genre where
> the tune is the quietest part and the chords hold whole bars, that is a
> ten-minute record with one four-bar loop in it."*

Lofi is not that genre — its first keyboard is busy — but the structural point
holds and the measurement says so: **24 of 24 lofi records have a chorus whose
harmony is the verse's.**

---

## 5. THE ONE THING THE MACHINERY COULD NOT SAY — AND MY FIRST ANSWER WAS WRONG

`extensions` is a weighted list of chord SIZES and it is read **by position**:

```js
const sizeAt = i => { … extRolls[i % extRolls.length] … }
```

`i` is where the chord sits in the progression. So a genre can say "about a
third of my chords are sevenths" and it **cannot say "the V is a seventh"** —
which is exactly and only what every jug band source says. Declaring
`extensions` alone would scatter sevenths across positions and land them on the
V by luck.

`qualities` cannot answer it either: `QUALITY_TABLE` deliberately serves only
major and minor, on the well-argued grounds that the corpus is major/minor and
sending dorian to the minor table would erase the mode's signature chord. Boxcar
is dorian in 16 records of 30. That reasoning is right and is not being changed.

### The wrong answer, built and then read

The first build made it a **size**: `seventhOn: [4, 1, 5]` floored those degrees
at four notes. It measured beautifully — boxcar went from 0% four-note chords to
52% — and then I printed the chords and read them:

```
  C#m   C#m7   C#m   F#   A#m7b5   A#m7b5   C#m   F#
  E     Emaj7  C#m   C#m  G#m7     G#m7     E     C#m
```

**A half-diminished chord and a major seventh are not jug band chords.** A size
stacks one more *diatonic* third, and a diatonic third on dorian gives whatever
dorian has — so the genre asked for its house chord and got two jazz ones. The
52% was a real number describing the wrong thing, which is exactly what this
project keeps writing down about measurement and then doing anyway.

### The right one: a dominant seventh is a KIND, not a size

It belongs in `pickQuality`, where kinds are decided, because `chordTones`
already builds an absolute interval set from a named quality **in any mode** —
which is precisely what the measured table cannot do here.

```js
dom7On: [4]      // the V. Scale degree, 0-indexed.
```

Checked before the measured table and returning immediately, so a genre that
declares it does not also spend its `qualities` draw on that chord. **No new
draw** — it reads the degree the chord already has — so a genre that does not
declare it is byte-identical. [Law 3]

**Only the V**, because that is the only chord the sources state without
qualification. `"experiment with playing I and IV chords as sevenths, too"` is
permission, not prescription — and a dominant seventh on the tonic would turn
this genre's dorian and minor records **major**, a far larger claim than
anything here supports. §8 keeps it open.

```
  C#m  C#m  C#m  F#   A#dim  A#dim  C#m  F#      verse   (no V in this progression)
  E    E    C#m  C#m  G#7    G#7    E    C#m     chorus  — the V, as a dominant seventh
```

---

## 6. WHAT WAS DECLARED

| genre | declares | why |
|---|---|---|
| **boxcarsynth** | `dom7On: [4]` | The V as a dominant seventh — the one chord every source states flatly. §5. |
| **lofi** | `chorusProgressions` | 24/24 records had a chorus with the verse's chords. The progressions open off the tonic and lean brighter, per [corpus:unison]. |
| **dungeonsynth** | nothing | Triads are what its sources ask for. §2. |
| **synthwave** | nothing | Has the same chorus gap as lofi, and nobody is working on this genre — the owner's standing instruction. Named here so it is a decision rather than an oversight. |

---

## 6a. WHAT IT MEASURED

```
                          distinct chords     chorus ==      chords that
                          in a whole record   verse chords   are dom7
  lofi        before            4.8             24/24            —
              after             7.4              0/24            —
  boxcarsynth before            6.8              0/24           0%
              after             6.7              0/24          10%
  synthwave   unchanged         3.8             24/24           0%
  dungeonsynth unchanged        3.7              0/24           0%
```

**Lofi's chorus is a different place now** — 4.8 distinct chords in a record to
7.4, and the chorus stops being the verse in every record. Read on seed 1
(C# minor): the verse is `C#m7 F#9 C#9 G#m7` and the chorus is
`B7 E9 A9 C#m7` — it opens off the tonic on the flat-seventh dominant and moves
through **E, the relative major**, which is the brightening the source asked for
done inside the scale.

**Boxcar's harmony did not get more varied and that is the honest reading.**
6.8 → 6.7 distinct chords: the dominant seventh replaces a triad on the same
root, so it changes the chord's *colour* and not the record's *harmonic range*.
10% of chords are dom7, which is exactly how often degree 4 appears. The claim
this supports is "the V is now the right chord", not "the harmony moved".

**And the faders are where they were.** Every genre pair, 3 mixes, 40 seeds —
1,440 combinations: **24 threw before, 26 after**, 1.7% against 1.8%. Noise, not
a regression, and measured wide enough to say so.

**Blast radius, per genre, 150 seeds each, every played event hashed:**

```
  lofi          150 / 150 songs moved
  boxcarsynth   150 / 150 songs moved
  synthwave       0 / 150
  dungeonsynth    0 / 150
```

---

## 6b. ONE THING THIS FOUND AND DID NOT TOUCH

**Boxcar's verse contains diminished triads** — `A#dim` on seed 1, `Bdim` on
seed 2, both in the verse progression. That is degree 5 of dorian, stacked as a
plain triad, and it is **pre-existing**: it reads identically on the build before
this one. A diminished triad is not a jug band chord either, but it comes from
the progression tables rather than from anything here, and changing those is a
different build with a different measurement. Named, not fixed.

---

## 7. WHAT THIS DOES NOT DO

- **It does not touch dungeon synth's harmony.** §2, with the reason.
- **It does not give synthwave a chorus progression**, though it measured the
  same 24/24 fault there. Out of the named scope; named anyway.
- **It does not make the progression vary within a record.** One progression is
  drawn per song and every verse plays it. That is a bigger question — §8.
- **Nobody has heard any of it.**

---

## 8. THE BIGGER ONE THIS MEASUREMENT FOUND AND DID NOT FIX

**A record's entire harmonic content is one progression drawn once.** Every
verse plays the same four chords in the same order; the chorus now differs in
three genres of four, and the bridge exists in 2–9 records of 24. That is why
the distinct-chord count in §1 is between 3.7 and 6.8 for records that run one
to three minutes.

And two more the sources name that this program cannot state at all: the
**ragtime chain of secondary dominants** (VI7–II7–V7–I) needs chromatic roots,
and `progressions` is scale degrees — the neo-Riemannian path is the only
chromatic door in the file and it moves triads, not dominants. The **I7 and IV7**
are the other half of arlotone's sentence and are left to an ear verdict.

Nothing in the engine can say "the second time through, the last chord goes
somewhere else" — the harmonic equivalent of the developed restatement that
landed for the tune on 2026-08-18. It is named here and in `BACKLOG.md`, with
the note that the tune's version of this move is now built and could be read
for how the same idea is shaped.

---

## Sources

- [Tips for Jug Band Jams — Arlotone](http://www.arlotone.com/jug_jams.html) *(page 503s on fetch; quoted from indexed text and marked as such at the quote)*
- [Ragtime progression — Wikipedia](https://en.wikipedia.org/wiki/Ragtime_progression)
- [Dominant 7th chords — Happy Bluesman](https://happybluesman.com/dominant-7th-chords/)
- [LoFi Chord Progressions: The 6 Best Chord Progressions for LoFi Music — Unison](https://unison.audio/lofi-chord-progressions/)
- [Memphis Jug Band — Wikipedia](https://en.wikipedia.org/wiki/Memphis_Jug_Band) *(instrumentation, for the genre's identity)*
- `docs/genre-research/chord-quality.md` §5 — why only major and minor read the measured table, unchanged by this
- `docs/genre-research/dungeon-synth-arrangement.md` — the triad/open-fifth research this sheet declines to undo
- `docs/genre-research/the-nine-files-against-the-program.md` §3 — the chorus gap, confirmed here
