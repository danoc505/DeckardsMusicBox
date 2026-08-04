# What kind of chord it is — and what 1170 jazz tunes actually do

*Researched 2026-08-04. Phase 1 of using the measured music already sitting in
this repo. The question: this program can decide WHICH step of the scale a
chord is built on, but it has no way to say WHAT KIND of chord that is. The
answer has to come from measurement, and there is a corpus here to measure.*

**Plain English first, because two words are unavoidable below.**

- A chord's **quality** is what kind of chord it is — major, minor, or one of
  the four-note kinds that sound tenser and richer. It is separate from which
  note it is built on.
- A **dominant seventh** is the tense four-note chord that wants to fall to the
  chord a fourth above it. It is the single most common chord in jazz.
- A **half-diminished** chord is a minor chord with its fifth flattened and a
  seventh on top. It matters here because it turns out to be the most common
  second chord in a minor key, and the old ingest could not see it at all.

---

## 0. WHAT THIS PROGRAM CAN SAY TODAY, AND WHAT IT CANNOT

The whole of chord construction is six lines:

```js
function chordTones(root, mode, d, size){
  const n = size === true ? 4 : (size === false || size == null) ? 3 : size;
  const out = [];
  for(let i = 0; i < n; i++) out.push(degMidi(root, mode, d + 2 * i));
  return out;
}
```

It picks a step of the scale and stacks notes a third apart **inside that
scale**. Since `2026-08-04a` it can stack up to seven of them, so ninths and
elevenths are reachable. But:

- **Quality is never named.** It falls out of which scale and which step. A
  genre table cannot ask for a dominant seventh, because there is no word for
  one anywhere in the file.
- **Nothing chromatic can ever happen this way.** Every note comes from the
  scale, so every chord is inside the key by construction. Previously measured:
  **0.0% of chords sit outside the key in six of the seven genres**, and 10.4%
  in the seventh, which reaches them by a different mechanism entirely.
- **A dead flag has been waiting for this.** `tri.dom` is read at one place and
  set by nothing; the comment beside it says the flag "is what makes a secondary
  dominant pull." There are no secondary dominants. It has been dead for
  several sessions.

---

## 1. THE CORPUS, AND HOW STRONG ITS PROVENANCE ACTUALLY IS

`treebank.json` from the **Jazz Harmony Treebank** (Digital and Cognitive
Musicology Lab, EPFL, with McGill; ISMIR 2020). Downloaded fresh and counted
rather than taken on trust:

- **1170 tunes** carry a key and a list of chords.
- **150 of those** also carry the expert-checked hierarchical analysis that the
  published paper is actually about.

**Those two numbers mean different things and this repo's own note blurs
them.** `corpus/README.md` says "1170 standards" without saying that the
expert-annotated part is 150. The chords for all 1170 come from the open
iRealPro collection — real changes to real standards, transcribed by players,
not checked by the paper's authors. So: a large and genuinely useful body of
chord changes, with the strongest-provenance slice being about an eighth of it.

Chord progressions are not copyrightable, which is why this material could be
taken whole in the first place while everything melodic was shredded.

---

## 2. THREE FAULTS IN THE INGEST THAT IS ALREADY IN THIS REPO

`corpus/ingest_jazz.py` produced the `JAZZ_CORPUS` embedded in MK1. Reading
its output against the source found three separate errors, and together they
make the shipped table untrustworthy.

**(a) It reads flat keys a semitone sharp.** In this dataset the key field
writes a flat as `-`, so E-flat major is `E-`. The parser only understands `#`
and `b`, so it takes `E-` as plain E. **445 of 1170 tunes are in a flat key
written that way** — over a third of the corpus, every chord in them filed
under the wrong step.

**(b) It cannot see a half-diminished chord.** The dataset writes it `%`, as in
`A%7`. The parser looks for three other spellings and not that one, so every
half-diminished chord falls through to the bottom of the checks and is recorded
as a **dominant seventh** — a completely different chord with the opposite
job. In minor keys that is the second chord of the commonest progression there
is.

**(c) It folds every chromatic chord onto the nearest scale step.** The degree
function walks the scale and takes whichever step is closest, so a chord whose
root is outside the key does not get recorded as outside the key — it gets
recorded as a diatonic chord that never happened:

```
  a flattened fifth   recorded as a fourth
  a flattened second  recorded as the tonic
  a flattened sixth   recorded as a fifth
```

That is what a tritone substitution is, and it is the most characteristic
chromatic move in the idiom. In the shipped table it is invisible, and worse
than invisible: it inflates the diatonic steps with chords that contradict
them.

**Consequence.** `JAZZ_CORPUS` as embedded reports major I as "plain major
47%". Re-derived correctly it is **major-seventh 49%**. It reports 69.8% of
chords as having four notes; the real figure is **90.3%**. **Do not build on
the embedded table. Re-derive from source.**

*(This is not a criticism of a past decision — it is three parsing bugs, and
they are the same class of thing this project keeps catching by measuring.)*

---

## 3. WHAT THE REPERTOIRE ACTUALLY DOES — re-derived, all three faults fixed

1170 tunes, 59,150 chords.

### 3a. Almost nothing is a plain triad

```
  dom7   39.5%      the tense four-note chord that wants to fall
  min7   27.3%
  maj7   17.3%
  maj     5.5%      a plain three-note major chord
  m7b5    4.0%      half-diminished
  min     2.6%
  dim7    2.2%
  sus4    1.5%

  four notes or more:  90.3%
  plain three notes:    9.7%
```

**Nine chords in ten have four notes or more.** For comparison, five of this
program's seven genres declare `sevenths: false` and therefore play three-note
chords exclusively — including one whose own table comment says, in writing,
that its harmony is built on added ninths and suspensions.

### 3b. Which kind of chord sits on which step — MAJOR keys

45,345 chords. **15.0% have a root outside the key.**

| built on | how often | what kind it is |
|---|---|---|
| **I** | 19.5% | maj7 49%, plain major 24%, dom7 21% |
| **V** | 17.1% | **dom7 80%** |
| **II** | 17.0% | **min7 70%**, dom7 22% |
| **VI** | 11.2% | dom7 54%, min7 37% |
| **III** | 8.7% | min7 51%, dom7 30%, m7b5 10% |
| **IV** | 8.2% | maj7 38%, dom7 28%, min7 24% |
| ♭VII | 3.8% | dom7 71% — *outside the key* |
| VII | 3.4% | dom7 53%, m7b5 24% |
| ♭III | 3.2% | dim7 32%, dom7 31% — *outside the key* |
| ♭V | 3.0% | m7b5 28%, dom7 26% — *outside the key* |
| ♭VI | 2.7% | dom7 56%, maj7 26% — *outside the key* |
| ♭II | 2.3% | dom7 37%, dim7 23% — *outside the key* |

### 3c. Which kind of chord sits on which step — MINOR keys

7,310 chords. **14.4% have a root outside the key.**

| built on | how often | what kind it is |
|---|---|---|
| **i** | 24.5% | min7 56%, plain minor 25% |
| **V** | 16.4% | **dom7 82%** |
| **II** | 12.0% | **m7b5 53%**, dom7 26% |
| **IV** | 10.8% | min7 54%, dom7 31% |
| ♭VI | 7.8% | dom7 44%, maj7 37% |
| ♭VII | 7.3% | dom7 47%, min7 28% |
| ♭III | 6.9% | maj7 38%, dom7 37% |
| ♭II | 4.4% | dom7 56%, maj7 29% — *outside the key* |
| VI | 4.2% | m7b5 39%, dom7 32% — *outside the key* |

### 3d. The root almost always moves the same way

```
  up a fourth       50.4%
  down a semitone    9.5%
  up a fifth         6.2%
  down a third       6.0%
  stays put          5.8%
  up a tone          5.6%
```

**Half of all chord changes move the root up a fourth.** That single fact is
the engine of this harmony, and this program has no notion of root motion at
all — its progressions are lists of scale steps with nothing said about the
distance between them.

### 3e. How tunes end

```
   309  major  IImin7 → Vdom7
   125  major  Vdom7  → Imaj
   105  major  Vdom7  → Imaj7
    33  minor  IIm7b5 → Vdom7
    33  minor  Vdom7  → Imin7
    22  minor  Vdom7  → Imin
```

**Read the top line carefully — it is not a cadence.** A lead sheet is written
to be repeated, so a great many tunes "end" on the turnaround that sends you
back to the beginning. The genuine ending is **V7 → I, 230 times**; and in
minor, **half-diminished II → V7 → i**, which is the commonest progression in
minor-key jazz and which the old ingest could not represent.

---

## 4. WHY THE NUMBERS LOOK LIKE THAT — the theory behind the measurement

Two patterns above are not accidents and both have names.

**A dominant seventh on a step that is not the fifth is a secondary dominant.**
It is "a chord that behaves as a V or V7 and is used to resolve to a chord
other than the tonic", and its altered note "acts as the leading tone to the
root of the chord being tonicised" [corpus:mymusictheory; corpus:pugetsound;
corpus:pianowithjonny]. That is exactly what the tables show: in a major key,
VI is a dominant seventh 54% of the time — pointing at II — and II is a
dominant seventh 22% of the time, pointing at V. **This is the mechanism the
dead `tri.dom` flag was written for.**

**The fifth in a minor key is a dominant seventh 82% of the time**, which
requires raising the seventh note of the scale — the harmonic minor. The
sources name this directly: the harmonic minor's raised seventh "supports the
creation of these secondary dominant chords with their characteristic leading
tones" [corpus:pugetsound]. This program **defines harmonic minor in its scale
table and no genre draws it.** Here is the evidence for drawing it.

---

## 5. WHAT THIS DOES NOT TELL US — the limits, stated before anything is built

- **It is a jazz corpus, and only one of the seven genres descends from jazz.**
  Lofi hip hop is jazz harmony slowed down, and these numbers are strong
  evidence for it. For synthwave, Donkey Kong, Blade Runner, acid, minimal
  techno and jungle they are **weak evidence or none**, and the standing rule
  applies: no genre's table changes without that genre's own research.
- **The corpus knows two scales; this program has seven.** Every tune here is
  in major or minor. Lofi lives largely in dorian, which is neither. The
  minor table is the closer of the two but it is not the same thing, and
  saying so is not a formality.
- **A chord's quality here is a label, not a voicing.** The corpus says "minor
  seventh"; it does not say which notes were played or in what order. Spacing
  and inversion are a separate question, already open elsewhere.
- **Endings are contaminated by the lead-sheet format** (§3e). Anything built
  on cadences needs the last-chord question asked more carefully than "take the
  last two".
- **The 1170 are player transcriptions**, not scholarly editions. The
  expert-checked slice is 150 (§1).

---

## 6. WHAT TO BUILD, in the order the evidence supports

1. **Give a chord an explicit quality**, so a table can name one. Everything
   else here depends on it, and the dead `tri.dom` flag is waiting for it.
2. **Re-ingest from source with the three faults fixed** (§2), keeping
   chromatic roots as chromatic rather than folding them onto the scale.
3. **Weight the qualities per step from the measurement**, per genre, per mode
   — as constraints the genre declares, never as a list of chords to replay.
4. **Then, and only then, root motion** (§3d) and the minor ii–V (§3e), which
   are the two things that would most change how this music moves.

Nothing in step 3 or 4 touches a genre other than lofi without that genre's own
research first.

---

## 7. WHAT WAS BUILT, AND WHAT IT MEASURES — `2026-08-04d`

Steps 1 and 2 above are done. Steps 3 and 4 are not.

**The mechanism.** A chord can be asked what kind it is. When it is told, that
decides its first four notes — root, third, fifth, seventh — and anything above
a seventh still comes from the mode, so a ninth stays diatonic and a modal
genre goes on sounding like its mode. A genre declares `qualities`, a number
from 0 to 1: how often a chord takes its kind from the measurement rather than
from stacked thirds. Absent means unchanged, and the draw runs either way, so
adding it to one table cannot move a note in another.

**Only major and minor songs read the table, and that is a correction to §5.**
The first version sent every mode to whichever table shared its third. That is
wrong in the one case that matters most: dorian and natural minor differ by one
note, and that note is what makes the chord on the fourth step major in dorian
and minor in natural minor — the chord `lofi-harmony.md` §4 calls "the one
clean discriminator" between the genre's two minor modes. The corpus's minor
table would have made that step a minor seventh 58% of the time and **deleted
dorian**. So a mode reads the table only when it IS that key; everything else
keeps the chords its own scale gives it, and the reason is that there is no
measurement for dorian rather than that caution seemed wise.

**Measured, 40 seeds a genre, against the build before it:**

```
  genre         asks for   chords   named    four notes   outside the key   lead clash
  lofi   before     0        320     0.0%        81.3%              0.0%        16.2%
  lofi   after      0.75     320    51.9%        89.4%             20.9%        18.7%
  every other genre, both builds: 0.0% named, 0.0% outside the key, unchanged
```

**And what it writes, held against the corpus it learned from:**

```
     kind      we write    the corpus
     dom7        41.0%         44.1%
     min7        41.0%         29.6%
     maj7        16.3%         14.9%
     maj          1.2%          5.0%
     min          0.6%          0.9%
```

Four-note chords 89.4% against the corpus's 91.3%.

**The convergence worth naming.** Seed 1's progression was `C#m7 F#m7 C#m7
G#m7` and is now `C#m7 **F#7** C#m7 G#m7`. That second chord is a dominant on
the fourth step — the exact chord `lofi-harmony.md` §4 identified from
completely separate sources as the genre's signature, and which Richard Pryn
named outright: "the culprit for this is the dominant IV chord, the F7. This is
a borrowed chord from another key." A jazz corpus that has never heard of lofi
produced the chord the lofi research said to look for.

**Blast radius, on the notes rather than the audio:** 176 of 300 lofi songs
changed; **six genres byte-identical**, all 300 songs each. 176 is what 0.75
strength over the 7-in-11 of lofi songs that draw minor or major should give.

**THE ONE THING THAT GOT WORSE, and it is small.** A melody drawn from the
scale can now sound a semitone against a chord note that is not in the scale.
Measured: lofi's rate of that went **16.2% → 18.7%**. For scale, the six
genres with no chromatic chords at all sit between 13.6% and 19.9%, so lofi is
inside the band it was already in and below synthwave and acid — but it did go
up 2.5 points and it went up for this reason. The proper fix is for the melody
to know the chord's chromatic notes are available to it, which is a change to
how the tune is drawn and not to how the chord is built. Recorded in
`BACKLOG.md` §6.1.

The other laws barely moved: notes outside the key 0.0% → 2.1% (the point of
the exercise), dissonances that leap away instead of resolving 9.7% → 10.5%,
melody below the chord 6.7% → 7.5%.

**Also honest: the mechanism removes dominants as well as adding them.** The
same seed's bridge went `F#m7 B7 E7 G#m7` → `F#m7 Bm7 E7 G#m7`, because the
corpus puts a minor seventh on that step 32% of the time. That is a real draw
from real tunes, and it is a darker chord than what was there. Whether that
trade is wanted is an ears question, and the dial is one number.

---

## Sources

- [The Jazz Harmony Treebank — Harasim, Finkensiep, Ericson, O'Donnell, Rohrmeier, ISMIR 2020](https://program.ismir2020.net/static/final_papers/80.pdf)
- [JazzHarmonyTreebank — DCMLab, EPFL (the dataset itself)](https://github.com/DCMLab/JazzHarmonyTreebank)
- [Secondary Dominants — My Music Theory](https://mymusictheory.com/harmony/secondary-dominants/)
- [Secondary Dominants in Major and Minor — University of Puget Sound](https://musictheory.pugetsound.edu/mt21c/SecondaryDominantsInMajorAndMinor.html)
- [Secondary Dominants: The Complete Guide — Piano With Jonny](https://pianowithjonny.com/piano-lessons/secondary-dominants-the-complete-guide/)
- [Secondary Dominant Chords — StudyBass](https://www.studybass.com/lessons/harmony/secondary-dominant-chords/)
