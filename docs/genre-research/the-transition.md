# THE TRANSITION — the one file the program had no answer to

*Built 2026-08-19. `002` is 647 lines about transitions and nothing else, and
`the-nine-files-read-again.md` §1 called it the largest gap in the program: not
one of its three markers was reachable.*

---

## 1. THE THREE MARKERS, AND ALL THREE WERE UNREACHABLE

`002` names exactly what makes a passage read as a transition rather than as a
section:

> "a **lack of melody**, a **lack of harmonic stability** and **odd phrasing**"

and it is emphatic about which matters most:

> "the music broke out of the structure of the phrasing that we'd seen so far,
> and **I think this might be the most important factor at play here**"

> "**A transition should make you feel like you're getting scooped up and thrown
> into the air with no idea where or when you're going to land.**"

Measured before this build, four genres, 24 records each:

```
  every section function the program could make
    bridge chorus instrumental intro outro postchorus prechorus verse
    — no transition

  every section length ever produced
    lofi 4, 8 · synthwave 4, 8 · dungeonsynth 4, 16
    boxcarsynth 8, 10, 12, 16, 18, 20
    — nothing was ever 1, 2, 3, 5 or 7 bars
```

---

## 2. WHAT THE THEORY CALLS EACH MARKER

**Harmonic instability has a name and a standard device.** Transitional writing
is marked by "more change, increasing dynamic levels, increased chromaticism,
increased rhythmic activity, **irregular hypermeter, and irregular phrase
lengths**", and transitional sections "commonly emphasize non-tonic harmonies,
**typically ending on dominant harmony**" [corpus:openmusictheory, *Formal
Sections in General*].

When a dominant is held across several bars, theorists call it **standing on the
dominant** — "an important marker of significant formal events in Classical-style
music" [corpus:fiveable].

And the reason a dominant works here is what a **half cadence** is: it "ends the
phrase on a dominant chord, which in tonal music **does not sound final**; that
is, the phrase ends with **unresolved harmonic tension**" [corpus:musicnotes].
Unresolved is the whole job — it is `002`'s "no idea where or when you're going
to land", stated as harmony.

**The lack of melody is the marker `002` says does the work on its own:**

> "the lack of melody was **literally the only difference** between the setup and
> the section that followed"

Its worked example is this program's case exactly:

> "between the four bar introduction and the beginning of the main melody, **TWO
> BARS of the new groove are inserted** before the melody comes in… these two
> bars have less going on than the a section, there's no melody to follow and
> we're just sitting on the tonic"

---

## 3. WHAT WAS BUILT

**A `transition` section function, a `T` material, and a chord set that stands on
one degree.**

- **`transChords`** — the genre's declared degree, held for the whole material.
  Default **4, the dominant**, because that is what every source here names.
- **`T`** — drums, bass and chords. **No lead, no second keyboard, no repeating
  figure.** Not thinned: absent. Its bass and comp are built on `transChords` on
  their own named streams.
- **Insertion** — a genre declares which arrivals get set up, how often, and how
  long the setup runs. It goes **before an arrival, never first or last**: a
  transition transitions *into* something, so one at the top of a record has
  nothing to leave and one at the end has nothing to reach.

```js
transition: { before: ["chorus", "bridge"], chance: 0.55,
              bars: [[2, 5], [1, 3], [3, 2]], energy: 0.5, on: 4 }
```

Lofi declares it. The lengths are weighted to **2** because that is the length
`002` demonstrates; **`chance: 0.55` is `[EAR]`** and is the one number here with
no source behind it — the sources say what a transition *is*, not how often a
record should have one.

---

## 4. WHAT IT MEASURED

```
  lofi     transitions in 37 of 40 records, 65 in total
           lengths   1 bar ×14   2 bar ×35   3 bar ×16
           into      chorus ×54   bridge ×11
           lead notes composed inside one:  ZERO

  every section length lofi now produces:  1, 2, 3, 4, 8
  synthwave, dungeonsynth, boxcarsynth:    unchanged, 0 transitions
```

Read on lofi seed 1:

```
  0:24   TRANSITION   bars 8-10   78 bpm
  material T@1   playing: drums keys bass   energy 0.50

  bar 8    keys  |**-*----*-*-----|  D#3 B4 F#4 G#3 F#4 B4 F#3
           bass  |*------.........|  G#2
```

Two bars. No lead. The bass sits on **G♯2 — the dominant of C♯ minor** — and does
not move. That is standing on the dominant, no melody, and a length the program
could not previously produce, in one section.

### The measurement that was wrong before the program was

The first pass reported **12 lead notes inside transitions** across 65 of them,
which would have broken the one marker `002` says is decisive. Checked before
"fixing" it: every one of the twelve lands **0–5 ms before the arrival**. They
are the *arriving* section's own first note, nudged microseconds early by the
groove — an anticipation of the downbeat, not a melody in the transition. The
ruler was floor-ing a timestamp to a bar and attributing it to the wrong
section.

*When a measurement surprises you, suspect the measurement first* — third time
in this session.

---

## 5. THE BLEND FAULT, AND WHY IT IS A DRAW GROUP NOW

A blend drew lofi's `form.transition` beside another genre's `form.material`, so
the section existed and the material map had no entry for it: **117 of 432
blends threw** on `MAT["transition"]` being undefined. A section and the material
it plays are **one decision**, so `form.transition` joins `form.material`,
`form.roles` and `form.lengths` in the same draw group — and the insertion also
asks the table whether a transition material exists rather than trusting that it
does.

---

## 6. WHAT IS NOT BUILT

- **Only lofi declares one.** Dungeon synth and boxcar have arrivals too and
  neither has been researched for this.
- **`002`'s sus chords.** Its floating harmony is carried by dominant *sus*
  chords — "E7sus up a minor third to G7sus" — and `sus4`/`sus2` are defined in
  `QUALITY` and drawn by nothing, still. The dominant is the sourced default; the
  sus is the sourced *colour* and it remains unreachable.
- **`002`'s time-signature change.** "Changing time signatures like this is
  another great way to make the listener lose their footing." `METRE_GRID`
  supports 2/4, 3/4, 6/8, 9/8 and 12/8 and no genre declares any of them — a
  transition in a different metre is the obvious first use.
- **Writing in sequence *through* a transition**, which `002` pairs with
  chromatic drift. The sequence device exists now; nothing joins them.
- **Nobody has heard it.**

---

## Sources

- [Formal Sections in General — Open Music Theory](https://viva.pressbooks.pub/openmusictheory/chapter/formal-sections-in-general/) *(instability, chromaticism, irregular hypermeter and phrase lengths, ending on dominant harmony)*
- [Half Cadence — Fiveable, AP Music Theory](https://fiveable.me/key-terms/ap-music-theory/half-cadence) *("standing on the dominant")*
- [Cadences in Music Theory: The 4 Types Explained — Musicnotes](https://www.musicnotes.com/blog/cadences-in-music-theory-the-4-types-explained/) *(the half cadence does not sound final)*
- [Half cadence — Britannica](https://www.britannica.com/art/half-cadence)
- `002` on `main` — the transcript this serves, read in full
- `docs/genre-research/the-nine-files-read-again.md` §1 — the gap this closes
