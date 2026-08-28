# The melodic rhythm — the tune had onsets and no note lengths

*Researched, built and measured 2026-08-28. The owner's instruction was
"Fix the rhythm first then the counter"; this is the first half.*

> **NOTHING HERE HAS BEEN JUDGED BY EAR.** Standing caveat.

---

## 0. ⚠ THE FIRST VERSION OF THIS BUILD DID NOTHING, ON PURPOSE, AND THAT IS A HABIT

Recorded first because it is the more expensive mistake.

Both mechanisms below were built with a default of **zero** and then tested by
composing the same records and proving they were byte-identical. That was
reported as progress. The owner:

> *"Why are you concerned if everything stays the same when you're supposedly
> CHANGING the way everything is? Something in your instructions is making you
> make changes that DO NOTHING and then you prove they done nothing by testing
> that they have not changed anything! This is WRONG WRONG WRONG."*

He is right. **A test whose passing condition is that the music did not move is
a test that the fix was not applied.** The law being misread is this file's own
— *"a genre that declares nothing draws what it always drew"* — which exists so
a change cannot break music nobody measured. It is not a licence to ship every
fix as a dial set to zero and then pass a test for having done so.

**What decides whether a number is an engine default or a genre's:** whether
the thing it governs is a TASTE or is what the object IS. `theme.moves` is a
taste — an interval budget, Shire against Rohan — so its default is the old
hardcoded four and a genre opts in. **Note length is not a taste.** A tune whose
durations are `steps[i+1] - steps[i]` and nothing else has no rhythm in any
genre, and that was true of all five. So the default is the fix.

---

## 1. THE DEFECT, IN THREE MEASUREMENTS AND ONE PRINTOUT

32 seeds a genre, every lead note in materials A/B/C and their variants.

```
                    a note's length EQUALS      notes with ZERO      adjacent bars
                    the gap to the next          silence after       sharing a rhythm
  lofi                     73%                       76%                  2%
  synthwave                81%                       84%                  0%
  dungeonsynth             79%                       79%                  2%
  fantasysynth             80%                       85%                  1%
  ds2                      79%                       79%                  2%
```

**The cause is one line.** In `buildTheme`'s `phrase()`:

```js
  const plannedDur = i + 1 < steps.length ? Math.max(1, steps[i + 1] - steps[i])
                                          : (isBreath ? 4 : 3);
```

A note's length was the distance to the next onset and nothing else. **The tune
had no note values at all** — only onsets, with the space between them filled
in. Every note ran into its successor and the line never stopped.

**And here is dungeon synth's whole tune, seed 1, printed rather than counted:**

```
  bar 0  |*---*---*---*--.|   bar 1  |*---*---*---*---|
  bar 2  |*---*---*---*--.|   bar 3  |*---*---*---*---|
```

Four quarter notes, every bar, forever. The owner: *"Dungeon synth seed one is
just a series of notes played one step higher than the last… come that's not
piano playing is it?"* — and the rhythm is the other half of that sentence.

---

## 2. WHY IT COULD ONLY PLAY FOUR QUARTERS — THE POOL WAS TOO SMALL TO VARY

`theme.onsetPool` for dungeon synth was `[[0,8],[8,5],[4,2],[12,2],[6,1]]` —
**five seats** — and `count.hooky` draws four to five notes. Every bar took
nearly the whole pool, so there was nothing left to be different with: **49
distinct bar-rhythms across 339 bars of tune.**

**And no lead in this file could play a weak sixteenth.** The owner's own
source, on syncopation:

> *"If the 1 2 3 and 4 of our beats are the STRONG beats, the next weakest are
> the OFFBEATS, the ANDS — the ones between the 1 2 3 and 4. From there we can
> access what I call the E's and the A's… these are generally the WEAKEST beats
> that you will address when making most rhythms. **You can do a lot with these
> parts of the rhythm to give a sense of interest.**"* [docs 004, Drums]
>
> *"Syncopation is the utilization of the weaker subdivided beats in our
> rhythms; this creates a sense of rhythmic tension or surprise."* [same]

Measured against that hierarchy, before:

| tier | steps | dungeon synth | lofi / synthwave |
|---|---|---|---|
| strong | 0 4 8 12 | 4 of 4 present | 4 of 4 |
| the "ands" | 2 6 10 14 | **1 of 4** (only 6) | 4 of 4 |
| the "e"s and "a"s | odd steps | **0 of 8** | **0 of 8** |

So the pools are now that hierarchy, weights as tiers — strong heaviest, the
ands beneath, the e's and a's lightest. Nothing in them is a list of
nice-sounding steps; it is one ordering, derived, with each genre's accents on
top. Dungeon synth ships at 61% / 26% / 13%, lofi and synthwave at 52% / 32% /
16%.

**The first attempt gave the weakest tier 30% of the pool and lofi seed 1 lost
its downbeat** — bar 0 entered on beat 2. 30% for "generally the weakest beats"
is not a hierarchy, it is a flat spread. Reweighted and re-read before shipping.

---

## 3. WHAT WAS BUILT — TWO THINGS, BOTH ON BY DEFAULT

### 3a. `theme.detach` — a note may end before the next one starts. Default 0.5.

**The size of the gap is measured, not chosen.** The saxophone study this file
already cites for `artic`: **staccato silence is 25–29% of the inter-onset
interval** (0.29 slow, 0.27 medium, 0.25 fast), and it is a *proportion* rather
than a duration — the faster the line, the shorter the gap in milliseconds and
the same fraction of the beat. [corpus:Li/Palmer/Dalla Bella, PMC4097958] At a
sixteenth grid, 27% of four is one sixteenth, which is the resolution the grid
has.

**How often is [CHOSEN]** — the paper measures how big the gap is and never how
often a player takes one, the same sentence `articulate` already carries about
its own 0.35.

Two sources say why it matters, from opposite ends:

> *"Varying note durations, introducing syncopation, and strategically placing
> rests can add interest and drive to a melody… the rhythm of a melody is
> composed of a VARIETY of subdivisions of the beat."*
> [corpus:masterclass/rhythm, corpus:schoolofcomposition]

> *"A lead part doesn't usually go constantly throughout the whole song, so **in
> the spaces it leaves** you often want to add a little something else to
> maintain the interest."* [docs 009]

The second is the counter's job description, and **the counter could not do it
against a lead that left no spaces.** That is why the owner's order was rhythm
first.

The horn's phrase-join (`if(gap > n.dur && gap <= 12) n.dur = gap`) is now
skipped over a note released on purpose: the join exists because our phrases
died between notes by accident, and a detached note is the owner having decided
otherwise.

### 3b. `theme.motif` — the answer says it in the question's rhythm. Default 1.

> *"The rhythm in the melody is repeated **verbatim** throughout the verse, **even
> though the notes change**… The melody changes, but the melodic rhythm stays
> the same."* [corpus:sonicbids]

> A rhythmic motif is *"a short, recurring pattern of beats or rhythms, **without
> specific pitches**"* — Beethoven's Fifth is three short and one long, restated
> at pitch after pitch. [corpus:vaia, corpus:lumen/motive]

And the owner's own source says how many times: *"repeat it one time so you're
playing it two times in total… the third time, simply go somewhere different"*
[docs 006, the rule of 3]. **A question and its answer sharing a rhythm and
differing in their tune is what a period IS** — antecedent and consequent — and
this program had the two halves drawing independent rhythms.

**It is the answer that borrows, never the question**, so each material's rhythm
is still its own. **The hook is untouched** — it already restates bars 0–1
exactly, and handing it a rhythm would be handing it its own.

**Two corrections were needed before it worked, and both were found by
measuring rather than by reasoning:**

1. **The restatement has to carry the RELEASES too.** The detach draw was keyed
   on the bar, so an answer that borrowed the question's onsets re-rolled its
   own releases and came out a *different* rhythm — measured, and it took
   repetition **down** rather than up. Keyed on the source bar, question and
   answer breathe in the same places.
2. **The shape is what was WRITTEN, not what was asked for.** An onset can still
   be refused — no pitch fits the seat, or the repeat-merge absorbs it — and the
   two halves lose different subsets of the same list.

---

## 4. WHAT IT DID — MEASURED, 32 SEEDS A GENRE

```
                     notes ending exactly     zero silence      distinct bar-rhythms
                     at the next onset        after a note      per ~650 bars of tune
                     before   after           before  after      before   after
  lofi                73%      57%             76%     58%        136      207
  synthwave           81%      61%             84%     62%        186      265
  dungeonsynth        79%      52%             79%     57%         69      220
  fantasysynth        80%      62%             85%     73%        147      241
  ds2                 79%      52%             79%     57%         69      220
```

**The share of notes that are one quarter long**, which is the number the
printout showed:

```
  lofi 35% -> 29%   synthwave 38% -> 26%   dungeonsynth 54% -> 29%   fantasysynth 34% -> 18%
```

**The motif, measured at the mechanism** — of the answer bars handed the
question's rhythm:

```
  lofi 84% played it EXACTLY (+6% a subset)      synthwave 72% (+15%)
  dungeonsynth 77% (+4%)                          fantasysynth 76% (+12%)
```

**At the whole-record level the same number is 16–19% on lofi, against 4%
before, and roughly flat on the rest — and the reason is honest rather than
flattering:** most of the other genres' non-hook materials go the `motifOf` /
`augmentOf` road, which scales a source's rhythm and never calls `phrase()` at
all, and the `Avar`/`Bvar`/`Cvar` variants exist precisely to differ. The motif
reaches the question-and-answer road and nothing else.

### And here is the tune it was measured on, before and after

```
  dungeonsynth seed 1, material A          lofi seed 1, material A

  BEFORE                                   BEFORE
    bar 0 |*---*---*---*--.|                 bar 0 |*---*-*--.......|
    bar 1 |*---*---*---*---|                 bar 1 |*---............|
    bar 2 |*---*---*---*--.|                 bar 2 |*---*---*---*--.|
    bar 3 |*---*---*---*---|                 bar 3 |..*---..........|

  AFTER                                    AFTER
    bar 0 |*-*-*-------*--.|                 bar 0 |*-------*---*--.|
    bar 1 |*-------*-*-*---|                 bar 1 |*---............|
    bar 2 |*-*-*-------*--.|                 bar 2 |*-----..*--.*--.|
    bar 3 |*-------*-*-*---|                 bar 3 |*---............|
```

Dungeon synth: short-short-long, then long-short-short-short. **lofi bars 0 and
2 are the motif** — the same onsets, 0 / 8 / 12, on `B4 F#4 E4` and then on
`F#5 G#5 E5`. The rhythm repeated, the notes changed.

---

## 5. THE GUARDS

```
  single-genre records compose   149/150   (unchanged; lofi seed 17 is BACKLOG §0ac)
  blends compose                 179/180   (unchanged)
  melodic lines in the printout  297 -> 307 over 170 bars, dungeonsynth seed 1
                                  no bar lost its melody
```

And **with both mechanisms in the engine but their defaults still at zero, ten
whole records across five genres printed byte-identical** — which is the right
use of that test: it proves the mechanism is inert until it is switched on, and
it is not evidence that any work was done.

---

## 6. WHAT THIS DOES NOT FIX

**The counter is still four quarter notes.** From the same printout, every bar
of dungeon synth seed 1:

```
  ostinato counter  |*---*---*---*---|   C#5@0:4  G#4@4:4  C#5@8:4  G#4@12:4
```

The owner: *"What is a counter and why does it always look the same?"* The lead
now leaves the silence it needs — `gapAfter` mean 1.00 → 1.29 steps, zero on
79% → 57% — and the counter still lands on a lead onset **80% of the time on
dungeon synth against a declared `answer: 0.85`.** That is the second half of
the instruction and it is next.

**The bass is still a drone** in dungeon synth — `C#2@0:18>` held across bars.
Named before, still open.

**`theme.motif` cannot reach the derived materials.** `motifOf`/`augmentOf`
build their rhythm by scaling a source's, so the AAAB shape the sources describe
only exists on the question-and-answer road. Named, not built.

---

## SOURCES

- [Songwriting 101: rhythmic motifs — Sonicbids](https://blog.sonicbids.com/songwriting-101-secret-to-writing-catchy-songs-rhythmic-motifs) — "the rhythm in the melody is repeated verbatim… even though the notes change"; the AAAA formula
- [Rhythmic Motifs — Vaia](https://www.vaia.com/en-us/explanations/music/music-composition/rhythmic-motifs/) · [Motive — Lumen Music Appreciation](https://courses.lumenlearning.com/suny-musicappreciationtheory/chapter/motive/) — a rhythmic pattern without specific pitches; the Fifth's short-short-short-long
- [Understanding Rhythm in Music — MasterClass](https://www.masterclass.com/articles/understanding-rhythm-in-music) · [How Rhythm Really Works — School of Composition](https://www.schoolofcomposition.com/music-rhythm/) — varying note durations, syncopation, placing rests; a variety of subdivisions
- [7 Melody Writing and Motivic Development Techniques — Flypaper](https://flypaper.soundfly.com/write/7-melody-writing-and-motivic-development-techniques-for-songwriters/) — sequence and rhythmic displacement
- Li, Palmer & Dalla Bella, *Production and perception of legato, portato and staccato articulation in saxophone playing*, PMC4097958 — staccato silence is 25–29% of the inter-onset interval, and it is a proportion
- **The owner's own transcripts**: `docs 004 (Drums)` — the strong beats, the ands, the e's and the a's, and syncopation as the use of the weak ones; `docs 006 (rule of 3)` — say it twice, then go somewhere different; `docs 009 (loop2songC)` — the lead leaves spaces and something else fills them
- `docs/genre-research/the-melodic-peak.md` — the pitch half of the same phrase
