# INTERVAL ENCODING — what the literature knows about writing a tune as deltas

*2026-08-30, at the owner's instruction: "deep research: interval based encoding
and Melodic Math." Five passes — four on the literature, one auditing and
measuring the engine — ~440 tool calls. Every number traced to a named corpus,
an experiment, or a script that was run against this branch.*

**§10 is the measured half and the part with teeth.** The literature sections
say what is known; §10 says what this program actually does, and it found four
defects, including two genres that turn out to be one.

**This is the companion sheet to `melodic-math.md`, not a replacement for it.**
That sheet has the notation and where it came from — the owner's annotated
piano rolls. This one asks a different question: **the program already writes
its tunes as intervals rather than pitches. What is known about doing that?**

The repo had no answer. `melodic-math.md`'s sources are four pieces of web
pedagogy (Vaia, Fiveable, Soundfly, Musician Wave) and one arXiv paper. Nothing
in the file cites a melodic corpus, an interval distribution, or a perception
experiment. Everything below is new ground, and a good deal of it bears on
things already built.

**Read §1 first.** It is a correction to a load-bearing line in the other sheet.

---

## 1. THE MOVEMENT UNIT IS SCALE STEPS, AND ONE SHEET SAYS OTHERWISE

`melodic-math.md:53` states the notation's rule as:

> numbers are durations in 16ths, the parenthesis carries the interval to the
> NEXT note, **`i` counts semitones**, `N` is none

`MELODIC-MATH-ENGINE.md` §2c says the opposite and shows its working: the *Smoke
On The Water* caption glosses `x2` as "2 semitones" and points at D3 → F3, which
is **three** semitones and exactly two steps of the mode. "Every diagram in the
sheets reads as scale steps; only the prose says semitones."

**The engine doc is right, and it is now independently corroborated.** Checked
against published transcriptions: the riff is conventionally G, B♭, C, D♭ —
intervals 0/+3/+5/+6 from the root. The owner's D3, F3, G3, G♯3 has that
interval structure exactly from D.

So `melodic-math.md:53` is wrong. It is a one-line fix, and by this project's
own law it is the expensive kind of wrong — *"a provenance that does not match
its constant is worse than none, because it stops anyone checking."* A reader
who trusts line 53 and writes `movePool` in semitones gets a different music.

The engine's `moveUnit: "step" | "semitone"` is the correct resolution and needs
no change.

### And the mode label on that sheet does not hold

**MEASURED against published sources.** *Smoke On The Water* is described by
Wikipedia as "a four-note blues scale melody in G minor, harmonised in parallel
fourths", and Blackmore's own account is "harmonized parallel fourths, plucked,
never picked, in the third position."

**[INFERENCE — mine, not published]** The owner's roll is almost certainly the
**lower voice of those fourths**: G-B♭-C-D♭ harmonised a fourth below is
literally D-F-G-A♭. So the pitches are a real voice on the record, not an error.

But **G Phrygian does not fit the riff**. G Phrygian is G A♭ B♭ C D E♭ F. The
riff's D♭ is not in it, and Phrygian's defining A♭ never sounds in the riff.
Where A♭ *does* appear is the **chorus** — the Rockschool teaching chart gives
`| C / / / | Ab / / / | G5 | G5 |`, and Desi Serna analyses that C as G Dorian
and that A♭ as G Phrygian, i.e. modal interchange.

Honest label: **G minor blues / minor pentatonic + ♭5, the riff notated as the
lower voice of parallel fourths.** Record Phrygian against the chorus only.

**The arithmetic in the sheet is unaffected and checks out:** A(4+4=8) + B(6) +
A(8) + C(2+8=10) = 32 sixteenths = two bars of 4/4, and the full
`A+B+A+C+A+B+A+c` = 64 = four bars, which matches the riff's conventional
length.

### The Final Countdown sheet checks out

**MEASURED.** Published sheet music is in F♯ minor (Musicnotes, multiple SKUs).
All six pitches on the roll — C♯4, D4, B3, F♯3, A3, G♯3 — are diatonic to F♯
natural minor with no accidentals outside the key. One caption fix only: that
figure is the **keyboard fanfare**, not the sung melody. Calling it "Melody" is
loose.

---

## 2. WHAT INTERVAL ENCODING BUYS, AND WHAT IT COSTS

| scheme | invariant to | throws away |
|---|---|---|
| absolute pitch (MIDI number) | nothing | nothing |
| **chromatic interval** (semitone delta) | transposition, key, register | register/tessitura, tonal function, mode |
| **scale-step delta** — *what this program uses* | transposition **and mode** (major/minor collapse) | chromatic alteration, which semitone size realised the step |
| scale degree / key-relative | transposition, octave | octave, contour, interval size |
| contour (Parsons `u`/`d`/`r`) | transposition **and interval size** | everything but the sign |
| interval-class vector | transposition, inversion, **order** | the melody itself |

Parsons is Denys Parsons, *The Directory of Tunes and Musical Themes* (1975).
Interval-class vectors are Forte (1973) and are order-destroying — a set
descriptor, never a melodic encoding.

**The measured case for intervalizing.** Le, Bigo & Keller (AAAI-2025 AI4Music
workshop, arXiv 2501.04630) is the only direct ablation found: intervalize a
REMI token stream against a chosen reference line, 42 trainings per task, 3
seeds. Intervalization improved **all three** tasks, from **+1.2%** to **+6%**.
The more useful result is the second one: **the choice of reference line mattered
more than the fact of intervalizing** — a melodic reference was best in 11 of 12
comparisons for start-of-phrase detection, a bottom-line reference in 10 of 12
for chord-inversion identification, and neither made any significant difference
for era classification.

**And a countervailing result.** Li & Huron (ICMC 2006) report a **scale-degree**
transition model learning note transitions better than an interval-only model on
Essen (major n=5,416, minor n=754, >150,000 notes). ⚠️ *Two separate research
passes failed to retrieve the full text (403), and two secondary summaries state
the direction of the result in opposite ways. **Treat as unresolved.***

**The documented failure mode is drift.** Rafraf (arXiv 2108.10449) encodes
melody as "a series of intervals rather than a series of pitches" and reports the
weakness as "excessive modulations in the compositions," attributed by the author
to "the nature of the encoding." Temperley (EMR 18(2), 2024) states the fragility
plainly: *"if one note in an intervallic representation is encoded incorrectly,
the entire remainder of the melody will be off."*

**Status in the program:** the engine is not exposed to either fault. It draws a
scale-step `move`, then realises it through `scaleStep` against the key and
clamps with `intoBand` — the pitch is recomputed from the mode every time, so
there is no accumulating delta to corrupt and no unbounded walk. The encoding is
interval; the realisation is key-relative and range-bounded. **That is the
architecture the literature recommends, arrived at independently.**

---

## 3. THE CORPUS NUMBERS

### 3a. Interval size — the best-replicated fact in the field

| corpus | mean absolute melodic interval |
|---|---|
| Essen Folksong Collection | **2.8 semitones** |
| Billboard | **3.8 semitones** |
| Weimar Jazz Database (456 solos, >200,000 tone events) | **2.7 semitones** |

[corpus:chiu-temperley-2024] for the first two; [corpus:frieler-weimar] for the
third. Jazz soloists are, on average, as stepwise as folk singers — and Frieler
shows this did **not** change across jazz history (Spearman ρ = .03, p = .5) even
though *maximum* interval size rose sharply (ρ = .347, p < .001). **The average
stayed put while the ceiling moved.** That is a distinction the program can
express directly: a `movePool` and a separate rare-large-leap allowance are not
the same dial.

Huron (2001, *Music Perception* 19:1–64) plots interval distributions for 181
works across ten cultures — American, Chinese, English, German, Hasidic,
Japanese, Pondo, Venda, Xhosa, Zulu — and reports "the preponderance of small
intervals" as a cross-cultural finding.

**A detail that matters for a scale-step encoding:** in Essen, **whole steps
(±2) are more than twice as common as half steps (±1)** despite being larger
[corpus:temperley-2014]. The cause is structural — a diatonic octave contains
five whole steps and two half steps. A scale-step encoding reproduces this for
free. A chromatic one does not.

### 3b. Step inertia — and it is a genre dial, measured

The probability that a step is followed by **another step in the same
direction** [corpus:chiu-temperley-2024, step = ≤2 semitones]:

| corpus | step inertia | optimised inertia weight |
|---|---|---|
| Essen folksong | **71%** | .51 |
| Barlow & Morgenstern (classical themes) | 67% | — |
| Hymn Tune Index | 63% | — |
| Rolling Stone | 48% | — |
| Billboard | **43%** | **.02** |

**Folk melodies continue steps; pop melodies reverse them**, and the fitted
weights differ by ~25×. This is the single most useful number in this sheet:
a measured, corpus-attributed, *genre-discriminating* quantity of exactly the
shape §5 of `MELODIC-MATH-ENGINE.md` asks for — a range a genre declares, not a
value baked into stage logic.

### And the table it belongs in already exists

**The mechanism is built.** `theme.moves` (`Deckards Orchestrator MK2.html`
~:38810) is a per-genre interval palette whose entries are **multiples of the
phrase direction**, drawn with `wpick(rng, MOVES) * dir`, so a genre says
"sometimes jump a fifth" without knowing which way this phrase is going. It was
added to fix a measured fault worth recording here, because it is the same fault
this section is about from the other side:

> `[[0,2],[dir,5],[dir*2,2],[-dir,2]]` — hardcoded, identical for all ten
> genres… **THE LARGEST INTERVAL EXPRESSIBLE ANYWHERE IN THIS PROGRAM WAS A
> THIRD.** Measured across ten genres: 41% step, 27% repeated pitch, 32%
> "leap" — and every one of those leaps came from `intoBand` folding a pitch
> back by octaves, not from a drawn interval.

So the interval palette is a genre decision now, sourced to
`lotr-themes-measured.md` §5.5 — *"Melody type is an interval budget. Shire =
steps and thirds. Rohan = fourths, fifths, sixths, outlined triads. That is one
number per theme."*

**What is missing is not the mechanism. It is the numbers, and §3b is where they
come from.** Read as step inertia — the share of directional draws that continue
in `dir` rather than reverse — the file currently stands at:

| table | weights | directional inertia |
|---|---|---|
| the default (any genre declaring nothing) | `[0,2] [1,5] [2,2] [-1,2]` | **78%** |
| declared table, lofi region | `[0,2] [1,10] [-1,8] [2,2] [-2,2] [4,2] [-4,1] [3,1] [-3,1]` | **56%** |
| declared table, dungeon synth region | `[0,2] [1,11] [-1,9] [2,2] [-2,2] [4,2] [-4,1] [3,1] [-3,1]` | **56%** |

Against the corpora: the two declared tables sit at 56%, between Rolling Stone's
48% and the Hymn Tune Index's 63% — a defensible place for sung popular music,
arrived at by ear and by the LOTR sheet rather than from this number. **The
default sits at 78%, which is more inertial than any corpus measured** —
above even Essen's 71%. Every genre that has not declared a table is writing
folk-song direction statistics, more strongly than folk song does.

*[The per-genre attribution of the two declared tables is from their position in
the file and is pending the code audit's confirmation — recorded as an
observation, not a measurement.]*

---

## 4. TWO MECHANISMS THE PROGRAM SHOULD NOT BUILD

### 4a. Post-skip reversal is a real statistic and a false mechanism

The oldest rule in melodic pedagogy — *a large leap is followed by motion in the
opposite direction* — was tested by **von Hippel & Huron (2000, *Music
Perception* 18(1):59–85)** on vocal melodies from four continents. Their finding:
skips carry a melody toward the edge of its tessitura, and from an edge most
available pitches lie in the opposite direction. There is **no evidence of a
reversal principle above and beyond regression to the mean**. Gap-fill, registral
direction and registral return are all **side effects of tessitura constraints**.

Von Hippel (2000b) separately found gap-fill plays little or no role in
listeners' melody classification.

**So: encode range, not a reversal rule.** A range term produces the observed
behaviour for free; a hand-coded reversal law double-counts it and buys nothing.

⚠️ *A widely circulated "≈72% of large leaps are followed by a reversal" figure
turned up in search summaries in two independent passes. **Neither could verify
it against the paper. Do not use it.***

### 4b. Do not multiply interval probability by scale-degree probability

**MEASURED, and this one bears directly on how the engine draws a note.**
Temperley (2014, *Music Perception* 31(4)) shows the two viewpoints
**double-count**: whole steps outnumber half steps in Essen largely *because* the
diatonic octave has five whole steps and two half steps, so multiplying a
chromatic-interval probability by a scale-degree probability over-predicts whole
steps and under-predicts half steps. K-L divergence against the true Essen
interval histogram rises from **<0.0001** for a pure zeroth-order interval model
to **0.10** when scale degree is multiplied in.

His cross-entropy table, Essen, bits/note (rows = interval order, columns =
scale-degree order):

| | Uniform | Zeroth | First | Second |
|---|---|---|---|---|
| Zeroth | 3.35 | 2.85 | 2.91 | 2.78 |
| First | 2.93 | 2.67 | 2.74 | 2.75 |
| **Second** | **2.69** | **2.56** | 2.65 | 2.68 |

Best configuration across four corpora is **second-order interval + zeroth-order
scale degree** (folksong 2.56, classical 2.97, chorale 2.26, rock 2.78). Higher-
order scale-degree information gains nothing. Temperley explicitly flags that
"multiplying interval and scale-degree probabilities may not be the ideal
solution" and points to Conklin & Witten's **linked viewpoints** instead.

**Status in the program: this is a live risk, not a hypothetical.** `buildTheme`
draws a `move` from a weighted interval pool, then realises it with `scaleStep`
against the mode, then — for a `LINES` instrument on a strong beat or a long note
— snaps to `nearestTone` of the chord. That is three viewpoints combined by
sequential filtering. The measured consequence of combining them naively is a
*distorted interval histogram*, and it would be invisible to every check the
harness currently runs, because nothing compares the realised interval
distribution to a corpus target.

---

## 5. WHAT LISTENERS ACTUALLY TRACK

### 5a. Which transforms survive — with numbers

**Dowling (1972, *Perception & Psychophysics* 12(5):417–421).** 355 UCLA
undergraduates; five-note atonal standards; comparisons transposed 1–7 semitones.
Mean area under the memory-operating characteristic, chance = .50:

| transform | mean | above chance in |
|---|---|---|
| **inversion** | **.70** | all 5 conditions |
| retrograde | .64 | 4 of 5 |
| retrograde-inversion | .55 | only 2 of 5 |

Ascending order of difficulty: **inversion → retrograde → retrograde-inversion.**

**Status in the program: material B is A's opening intervals inverted. That is
the best-supported choice available.** If the change vocabulary is ever extended,
retrograde-inversion is the weakest link and should be measured before it ships.

**And the finding that saves work:** *"There was no evidence that listeners
distinguish between transforms that preserve the exact interval relationships of
the standard stimulus and those that merely preserve its contour."* Exact
intervallic inversion buys **nothing** over contour-preserving inversion. Tonal
and real inversion are perceptually near-free — pick whichever the harmony
allows. This is also the single most-misquoted result in the area; two
independent passes verified it.

Krumhansl, Sandell & Sergeant (1987) add the caveat: mirror-form recognition in
twelve-tone contexts is possible for trained, *aware* listeners but with large
individual differences.

### 5b. Contour first, intervals later — and this program loops

- **Dowling & Fujitani (1971, *JASA*)**: contour carries recognition of
  *transposed* melodies; for *untransposed* comparisons listeners use interval
  information and contour effects are negligible.
- **Dowling & Bartlett (1981, *Psychomusicology* 1:30–49)**: at retention
  intervals of several minutes, discrimination of exact transpositions from
  same-contour "tonal answers" rises above chance. **Contour is easy to encode
  and rapidly forgotten; interval information is harder to encode and retained
  efficiently in long-term memory.**
- **Edworthy (1985, *Music Perception* 2(3):375–388)**: "Contour was found to be
  more salient for short melodies and at the beginnings of melodies, whereas
  pitch-interval was more salient for longer melodies and for later serial
  positions."

**This matters here more than it does for most music.** A record plays material
A ten or twelve times. Over those statements the listener migrates from hearing
contour to hearing intervals — which means **interval precision matters more in a
looping generative record than a single-hearing analysis would suggest**, and it
is an argument for the per-statement sequence table being diatonically exact
rather than redrawn each time.

### 5c. What carries identity — the measured answer to L3

L3 says a restatement must preserve at least one declared thing — span, head,
moves, or attacks — and leaves which one to the genre. Three corpus studies bear
on it:

- **Janssen, Burgoyne & Honing (2017, *Frontiers in Psychology*)**: 4,125 songs,
  9,639 phrases, 147 tune families from the Meertens Tune Collections. Phrases
  survive oral transmission when they occur **early** in the melody, are
  **shorter**, have **smaller pitch intervals**, and are **more expected** (low
  surprisal). Model explained ≈22% of variance. This is the closest thing to a
  measured "what must be preserved" law, and it favours **the head**.
- **Volk & van Kranenburg (2012, *Musicae Scientiae* 16(3))**: 360 Dutch folk
  melodies, 26 tune families, 1,426 annotated motif occurrences across 104 motif
  classes. Rated "obviously similar": **motifs 88.3%**, local contour **54.9%**.
  *"The recurrence of short characteristic motifs is most relevant for the
  perception of similarity"*; global features such as contour "play a less
  important role." **Direct support for L1.**
  And a caution: tune families differ in *which* dimension they preserve —
  family 22 keeps local rhythm (95.6%) while contour varies (52.9%); family 25
  keeps local contour (76.6%) while rhythm varies (53.1%). **L3's "which one is
  the genre's business" is corroborated as a real degree of freedom, not a
  dodge.**
- **Note the tension.** §5b says contour dominates at short range; Volk & van
  Kranenburg say motifs beat global contour. Different task and timescale —
  expert categorisation of complete notated melodies versus short-term
  recognition of five-note figures. Both are reported here rather than
  reconciled, because reconciling them is not something either paper does.

### 5d. There is no N-note identity threshold, and the search for one should stop

**Müllensiefen & Pendzich (2009, *Musicae Scientiae*)** analysed 20 US melodic-
plagiarism court cases; Tversky-similarity algorithms reached up to **90%**
correct classification, and the authors conclude explicitly that *"despite the
widespread belief that there is a fixed and simple limit to the number of
corresponding notes between two melodies, actual court decisions are based on far
more complex considerations."* The folk "8-bar rule" is a myth.

**But there is a usable machine answer, and two independent lines converge on
it** — which is the kind of agreement this project treats as worth building on:

- **Uitdenbogerd & Zobel (ISMIR 2000)**, 10,466 MIDI files, comparing contour,
  modulo-12 interval and exact interval: *"confirmed that contour was
  insufficient for good matching, but that the use of interval sequences worked
  well"* — **n-grams of length 5**, counted **distinct** (term frequency
  ignored), worked best.
- **Müllensiefen & Frieler (2004, *Computing in Musicology* 13)**, testing 34
  similarity measures against expert human ratings: the best predictor was a
  linear combination of a **rhythmically weighted pitch edit distance** and an
  **n-gram count-distinct** measure.

Different tasks — retrieval versus predicting human judgement — same answer.
**That is a defensible basis for a "is this still the same figure?" metric in
`mk2_score.js`**, which currently has no such measure.

---

## 6. RESTATEMENT — the distance law, and it bears on the newest commit

**MEASURED. Temperley (2024, *Empirical Musicology Review* 18(2)).** The
proportion of interval-matching repetitions that are **exact-pitch** rather than
**transposed** rises monotonically with the distance between them: correlation
with log(distance) **r = .98, p < .01** (Barlow & Morgenstern) and **r = .84,
p < .05** (Essen).

**Interval-only (transposed) repetition is a LOCAL device. Long-range restatement
preserves literal pitch.**

The rock numbers, from an 80-melody / 25,774-note Rolling Stone subset — the
closest corpus to this program's target styles. Proportion of interval-matching
repetition that is literal same-pitch repetition, by distance in measures:

| 0.25 | 0.5 | 1.0 | 2.0 | 4.0 | 8.0 | 7/8 | 9/8 |
|---|---|---|---|---|---|---|---|
| .591 | .492 | .488 | **.599** | **.708** | .610 | .391 | .344 |

So in rock melody roughly **half to 71%** of repeated intervallic material comes
back **at the same pitch**, and Temperley suspects even these overstate
intentional intervallic repetition. His earlier claim (2018) that interval-only
repetition is much rarer in rock than in common-practice music is confirmed here,
with a proposed cause: in rock it is often unclear what the scale is, so tonal
transposition is ill-defined.

**And repetition clusters at metrically parallel distances.** The intervallic
repetition preference is **.291–.405** at metrical distances against a chance
estimate of **.173** (B&M) / **.199** (Essen) — while non-metrical distances of
7/8 and 9/8 sit at **.200** and **.205**, essentially chance. **Restate a cell at
a metrically parallel offset or listeners will not hear the relation.**

### What this says about "the phrase moves across its statements"

The two newest commits on this branch build a per-statement sequence table —
each statement of a section carries an `N`/`E`/`F` offset in scale steps, with
`away` controlling the share of middle statements that leave the base.

The motivation was sound and is recorded honestly in `MELODIC-MATH-ENGINE.md`:
seed 782's chorus phrase was heard sixteen times and all sixteen began A♯4, and
the sheets name the device.

**But §6's evidence says the base case should dominate at long range, and the
`away` share is therefore load-bearing in a way the doc does not yet
acknowledge.** In the nearest measured corpus, 50–71% of long-range repeated
material returns at the *same pitch*. A sequence table whose middle statements
mostly depart would be writing a melody unlike the corpus it is aimed at. This is
not a claim that the feature is wrong — it is a claim that **`away` has a
measurable target and currently has none**, and that the right check is the
realised share of statements at the base pitch, per genre, against ~.50–.71.

Two supports for the feature as built, though:

- **"A departure returns"** — the rule that the last statement comes home — is
  the same shape as the corpus's preference for literal restatement at distance.
- The decision to hold the **ostinato** anchored while the lead and counter move
  matches Temperley's finding that the device is local: a ground that does not
  transpose is what makes a moving line legible as moving.

---

## 7. HOW OTHER ENGINES DO IT — and the program already agrees with them

| system | unit recombined | what intervals are used for |
|---|---|---|
| **EMI** (Cope) | beat-sized slices | **identity/matching**, not generation |
| **GenJam** (Biles) | 4-bit scale-degree genes | only inside mutation operators |
| **Impro-Visor** (Keller et al.) | chord-relative note categories | **bounds** (min/max rise), not pitches |
| **OMax** (Assayag & Dubnov) | pitch+duration slices | not interval-based at all |
| **CHORAL** (Ebcioğlu) | notes under ~350 predicate rules | one simultaneous viewpoint of several |

**The shared architecture is the one this program already has: interval is the
identity unit, harmony is the placement unit.**

- **Impro-Visor** is the closest match and the most useful corroboration. Its
  grammar terminals are chord-relative *categories* — `C` chord tone, `L` colour
  tone, `A` chromatic approach tone, `R` rest — and contour enters through a
  macro called a **slope** carrying the minimum and maximum rise in semitones
  between successive notes. Intervals constrain a pitch that harmonic function
  chooses. And when the two conflict: *"we prioritize chord tones higher than
  slope bounds."* **That is exactly what the engine's `LINES` chord-tone snap
  does on strong beats and long notes** — an independent arrival at the same
  precedence rule. Evaluation: of 20 test subjects, 95% correctly matched the
  generated Clifford Brown-style solo to the original, 90% Miles Davis, 85%
  Freddie Hubbard.
- **GenJam**'s invert operator has to *rescale back into the measure's pitch
  range* after inverting — an explicit anti-drift clamp, the same job
  `intoBand` does.
- **EMI** defines a *signature* as a pattern of **1 to 8 contiguous melodic
  intervals** recurring across a composer's works, and the pattern matcher
  *protects* signatures from being sliced apart during recombination. Coherence
  comes from a separate functional labelling (SPEAC), not from the intervals.
  **Interval sequences for recognising recurring material; a separate label for
  placing it** — which is what `materials.motifs` published beside the notes
  makes possible and nothing yet consumes.

### The cheapest published architecture, for a hand-written engine

Temperley (2014) compares a 2nd-order interval Markov model against a **Gaussian
model** — *proximity profile* (normal centred on the previous pitch) × *range
profile* (normal centred on the mean pitch heard so far) × *scale-degree
profile*:

| corpus | Markov | Gaussian |
|---|---|---|
| folksong | 2.56 | 2.73 |
| classical | 2.97 | 3.36 |
| chorale | 2.26 | 2.62 |
| rock | 2.78 | 2.98 |

Markov is better by 6–16% — on **15,649 parameters against 26**. AIC favours the
Gaussian model on all four corpora. **Three multiplied Gaussians and a
scale-degree table get within ~6–16% of a 15,000-parameter interval chain**, and
the range profile is what stops the drift in §2 without a correcting pass.

⚠️ Note the tension with §4b, which is Temperley's own: he shows multiplying
interval by scale-degree distorts the interval histogram, *and* his recommended
cheap model multiplies three profiles together. He does not reconcile these.
Reported as found.

---

## 8. THE CELL INVENTORY

- **Volk & van Kranenburg (2012)**: ~**4 characteristic motif classes per tune
  family** (104 classes over 26 families).
- **Dai, Yu & Dannenberg (ISMIR 2022, POP909 + PDSA)**: real phrases contain far
  fewer distinct half-note onset patterns than phrases assembled by sampling the
  dataset distribution, and fewer patterns go unrepeated. PDSA uses **54**
  distinct half-note onset patterns; POP909 uses all 128 possible. **7%** of PDSA
  phrases repeat the same rhythm pattern in every measure; **28%** follow
  `abab`, `aabbaabb`, `aba` or `abababa`. Best pitch prediction came from **70%
  song-specific + 30% background** even after removing near-duplicate phrases —
  direct evidence that **each song carries its own small, reused vocabulary.**
- **Dai, Zhang & Dannenberg (arXiv 2010.07518, POP909)**: most melodic phrases
  are 4 or 8 measures; repeated phrases cover **50–90%** of a song; **>90%** of
  songs contain two or three distinct melodic phrases, typically 1–3 per section.

**This is the measured version of `melodic-math.md` §10's "THREE OR FOUR PARTS",
which that sheet flagged as measurable and left unmeasured.** Caveat: POP909 is
*Chinese* pop, and the ~4 figure is Dutch folk song. **No published cell-count
data for electronic or EDM melody was found** — this was searched for
specifically in two passes. Treat any EDM number as unavailable, not as ~4 by
analogy.

---

## 9. AND THE DOCTRINE'S OWN PRACTITIONERS CALL IT A DIAGNOSTIC

`melodic-math.md` §10 correctly traces the name to Asaf Peres's shorthand for Max
Martin's toolbox. One thing that pass did not surface, and it matters to this
program specifically.

**Rami Yacoub** — Cheiron, co-writer across the Britney/Backstreet run — told
*Music Week*:

> "We never start writing by implementing the melodic math, we just write
> melodies that come to our head." … "Some people write songs by the math, but it
> feels very forced." … "The key is if you can write by the math and leave no
> stone unturned, but it still feels like you wrote it in 15 minutes."

**As its insiders use it, melodic math is a post-hoc diagnostic** — an analysis
applied after the melody exists. That is precisely the thing this program's
constitution forbids: *"No correcting passes. Constrain the next choice; never
repair the last one."*

This is not an argument against the engine. It is an argument for **not
inheriting the name's authority**. The program is doing something the pop
doctrine's practitioners do not claim to do — using the analysis as a generator —
and that is a defensible original position, but it should be stated as one.

Two further notes on the external doctrine, both **ASSERTED, never measured**:
the term is John Seabrook's chapter title, not Max Martin's; the syllable-mirror
rule comes from lyricist **Bonnie McKee** ("a line has to have a certain number
of syllables, and the next line has to be its mirror image"). ⚠️ *The McKee
sentences are reproduced consistently across secondary sources but were not seen
on a primary page (paywall). A Savan Kotecha SXSW 2017 quote about phrases
repeating "exactly syllable-wise" circulates widely; **the source page is now 404
and it could not be verified — do not quote it.*** Nobody has published
notes-per-phrase or repetition counts for Martin's catalogue.

Martin himself never uses the term in his longest interview. What he does say is
about contrast and preview: *"If you've got a verse with a lot of rhythm, you
want to pair it with something that doesn't. Longer notes. Something that might
not start at the same beat."* and *"There should never be too many new elements
introduced at the same time. One at a time."*

### And one constant in the file has no source behind it

`Deckards Orchestrator MK2.html:41606` carries `[corpus: verse->chorus register
lift ~ +1.5 st; the hook sits above the verse, not an octave above it]` — a
provenance that names **no document**, unlike the `[corpus:sax-material.md: …]`
form used elsewhere.

The nearest measured study is **Van Balen, Burgoyne, Wiering & Veltkamp (ISMIR
2013)**: 6,462 Billboard sections × 12 features, finding timbre features
(sharpness, MFCC variance, roughness) predict "chorusness" while **absolute pitch
height is weak** (pitch centroid coefficient 0.10). That does **not** falsify a
+1.5-semitone lift existing. It does mean the constant currently has nothing
checkable behind it, and that register is not the main measured thing separating
a chorus from a verse.

---

## 10. MEASURED AGAINST THE PROGRAM

*An audit pass ran alongside the research, on this branch at `40d1a4d`, stamp
`2026-08-30c`. Population: 5 genres × 40 seeds = 200, of which **199 compose**
(`lofi seed 17` throws the pre-existing `Bdev: keys2` seam error). Scripts in a
scratchpad, nothing written to the repo; the two probes that patch the source
patch it in memory, assert exactly one match, and carry a control that composes
both builds and compares every event — **identical on 50/50 records**.*

**What I verified myself, by reading the file rather than taking the report:**
the four `noRepeat` gates, the zero grep counts for §5's dial names, the two
`theme.moves` tables, `ds2` inheriting its whole `theme`, and `fantasysynth`
overriding part of one. Those are marked ✔. The rest are the audit's
measurements, reported as its own.

### 10a. The engine's intervals ARE folk-song sized — in every genre

Mean absolute melodic interval, lead, material A:

| genre | mean \|d\| | median | % at 1–2 st | % `N` |
|---|---|---|---|---|
| lofi | 2.77 | 2 | 68.7 | 0.0 |
| synthwave | 2.65 | 2 | 79.4 | 0.0 |
| dungeonsynth | 2.86 | 2 | 73.6 | 0.0 |
| fantasysynth | 2.92 | 2 | 72.7 | 0.0 |
| ds2 | 2.86 | 2 | 73.6 | 0.0 |
| **Essen folksong** [corpus:chiu-temperley-2024] | **2.8** | | | |
| **Weimar Jazz Database** | **2.7** | | | |
| **Billboard** | **3.8** | | | |

**This is item 4 of §11, and it half-answers itself.** Every genre in the file
writes leads whose mean interval is 2.65–2.92 semitones — Essen's number, to
within the noise, for all five. None of them is anywhere near Billboard's 3.8.
The program writes folk song, and it writes it in synthwave too.

That is consistent with §3b's other reading: the two declared `theme.moves`
tables sit at 56% directional inertia and the default at 78%, and neither the
mean interval nor the inertia is a genre decision anywhere it matters yet.

**And in scale steps — the unit the engine actually draws in — the lead never
exceeds 4.** Everything at ≥8 semitones is `intoBand` folding an octave, exactly
as the comment at :38786 says. Direction is close to balanced and the phrases do
**not** descend on average (lofi 514 up / 542 down, synthwave 1015/834,
dungeonsynth 1018/974) — worth noting against Tierney et al.'s Essen finding
that descent significantly outnumbers ascent.

### 10b. The docs' own headline numbers, checked

| claim | today | verdict |
|---|---|---|
| lead's second half copies its first: **88/199** | **87/199** | 1 out; no reading of the predicate gives 88 |
| bass: **69/199** | **41/199** | §9 still quotes the pre-phase-4 number |
| lead movement: median 2, 69–81% at 1–2, 0% `N` | 2, 68.7–79.4%, 0.0% | **reproduces** |
| bass `%N` 15–43%; synthwave 43% `N` / 36% ≥12 | 14.3–43.4%; 43.4% / 37.0% | **reproduces** |
| distinct bar rhythms, bass, per genre | lofi 2.46, synthwave 2.33, ds2 1.98 **exact**; dungeonsynth 1.23→2.10, fantasysynth 1.10→2.08 | **reproduces — the cleanest in the file** |
| nesting 78%, 85% after the bar-line fix, +7 points | 82% → 88%, **+6 points** | shape reproduces; absolutes 3 points high, and the pairing may be two rulers rather than two states |
| break: exactly one note, 26 of 40 | **26/40 at 8 seeds**; 102/199 with **17 losing two** at 40 seeds | reproduces at its own N, fails beyond it |
| 48 distinct sequence shapes; `NEEF` zero | **53 distinct; `NEEF` = 0** | **reproduces** |
| "all fifty records now carry their figure at >1 pitch level" | **19/50** by rhythm, 36/50 by interval; control **1/50** | control reproduces exactly; **the headline overstates** |

The pattern is worth naming: **the control measurements reproduce and the
headline claims drift.** Where the doc says "before this, 1 of 50", that is
exact. Where it says "all fifty now", it is 19. The before-numbers were measured
and the after-numbers were rounded up.

### 10c. And a second half that is still a copy — of the rhythm

The doc's headline counts pitch **and** rhythm. Counting rhythm alone:

```
lead second half is a bar-for-bar RHYTHM copy of its first:  152 of 199  (76%)
```

Because `displace` — weight 4 of 8 in the change pool — preserves the rhythm by
design (`KEEPS`, :39488), and because the answering phrase borrows the question's
rhythm **100% of the time in every genre** (`TH.motif` defaults to `1` at :38537,
used as `mRoll < MOTIF` at :39691, and `mRoll ∈ [0,1)` — a probability dial
pinned open). **The pitches moved; the rhythm did not.** Against `melodic-math.md`
§1 — *"a motif is recognised by its RHYTHM; its pitches are free"* — that is the
invariant holding and the variation happening in the one dimension the sheet says
is free. Whether that is right is a question for the ear, but it is not what the
178-word §1 describes.

### 10d. ✔ Two genres are one melodic program

`GENRE.ds2 = (function(D){ … merge(D, {…}) })(GENRE.dungeonsynth)` at :30937–31347,
where `merge` is a shallow `Object.assign`. **`ds2` declares no `theme:` key
anywhere in those 410 lines**, so it inherits dungeonsynth's entire theme object.

This is not a limitation of the fork mechanism — `fantasysynth` uses it properly
at :30226, `theme: merge(D.theme, { count: …, story: … })`. `ds2` simply does not
override the theme.

Measured consequence: **every pitched line — lead, counter, keys, keys2, ostinato
— plus key, mode and chords are byte-identical between `dungeonsynth` and `ds2`
on every seed tested (40/40).** Only drums, bass and sometimes drone differ.

**So any per-genre melodic number reported for both is one measurement counted
twice** — including rows in `MELODIC-MATH-ENGINE.md` §6 and §8b, and two rows of
§10a above, which are printed as measured and marked here instead.

### 10e. ✔ `noRepeat` is read through four gates, and the two that matter are dead

| line | gate | effect |
|---|---|---|
| :38490 | `TH.noRepeat !== false` | **on** by default |
| :40704 | `!(G.theme && G.theme.noRepeat === false)` | **on** by default |
| :41057 | `(G.theme && G.theme.noRepeat) ? …` | truthy — **`JOIN` is a no-op at all 10 call sites** |
| :47865 | `chart.table.theme.noRepeat === true` | **never runs** |

No genre declares `theme.noRepeat`. The file documents this exact failure twice
in its own comments — :38474 (*"it was then put behind `TH.noRepeat === true`,
which NO [genre declares]"*) and :39655 (*"so the branch has never once
executed"*) — **and it recurred.**

Measured: the repeated-pitch rule holds inside the material (0.0–1.1%) and not in
the record — **2,246 repeated pitches in 49,585 performance events, 4.5%**, worst
single record fantasysynth seed 19 with **385**. That is the owner's
six-times-reported complaint, fixed in the material and not in what is heard.

### 10f. ✔ Eleven of §5's fourteen dials are engine literals

Whole-file grep: `motifSpan`, `notesPer`, `lengthPool`, `movePool`,
`silenceShare`, `alignToBar`, `repeatLimit`, `preserve:`, `redraw:` — **0
occurrences each**. `moveUnit` — **1**, the assignment; no reader, so §2c's "the
units are declared, never assumed" is true of the notation and false of the
generator, which is unconditionally scale-steps.

`restate` `[1,2]`, `restateBy` `[-2,-1,1,2]`, `change` `[[displace,4],[subdivide,2],[swap,2]]`,
`detach` `0.5`, `seq.by` `[1,2]`, `seq.away` `0.55`, `breakAt` `[3,4]` all exist
only as reads against a hardcoded default, **and no genre declares any of them.**
`alterHead` and `freeTail` — named in §4's summary row and §5's `change:` pool —
have **0 occurrences**; the doc concedes `rhythmOf` and there are two more in the
same position.

### 10g. The answer to §9 — and it is the reverse of what §9 feared

§9 asks: *"If every lofi record comes out with the same make-up, the dials were
written as values and the whole point has been missed."*

**Every record has a distinct make-up** — 39/39, 40/40, 40/40, 40/40, 40/40. The
fear is not realised. But the spread comparison says where the variety is:

| dial | within-genre sd | between-genre sd | ratio |
|---|---|---|---|
| notes | 2.030 | 3.456 | **1.70** |
| sounding | 11.473 | 11.267 | 0.98 |
| span | 2.631 | 0.603 | 0.23 |
| meanMove | 0.435 | 0.066 | 0.15 |
| distinctRhy | 0.464 | 0.033 | **0.07** |
| pctN | 0 | 0 | — |

**The problem is not that records are alike. It is that the genres are.** The
seed moves `distinctRhy` 14×, `meanMove` 7× and `span` 4× more than the genre
does. Only `notes` carries real genre identity — and it comes from `count` and
`onsetPool`, the two dials genres actually declare. Which follows directly from
10f: eleven of fourteen melodic dials are one number shared by all five tables.

`pctN` takes exactly one value in every record of every genre: **zero.**

### 10h. L5 is not built

*"Every movement is stated… No note is an independent draw. This is what makes it
a line rather than a walk."*

Instrumented over 124 records: **400 movements stated, 9,062 drawn fresh —
4.23%.** `moveBias` reaches only themeB and its variants (:41682, :41688) and is
capped at four entries by `if(dna.length < 4)` (:38819). 95.8% of the lead's
movements are independent draws from a weighted pool.

**This is the law §3 of the engine doc calls load-bearing, and the thing it
forbids is what the program does.** It is also the one place where this sheet's
literature and the audit agree on a direction: §2's drift, §4a's range argument
and §7's "interval is the identity unit, harmony is the placement unit" all
describe a line whose movements are *stated somewhere* and realised against
harmony. Here they are drawn per note.

### 10i. And two smaller ones

- **`materials.motifs` is dead data.** Written at :43181, **read at zero other
  sites.** Its own comment (:43169) says "Nothing consumes it yet." Phase 2 ships
  a printout, not the capability §7 says is the point — nothing can ask which
  motif a note is in.
- **The break removes an instant, not a note.** :46182 draws a `breakStep` and
  :46187 skips *every* note at that step, so a doubled or duplicated lead loses
  both: **17 records of 199 lose two notes.** And §8b says "never from a bar of
  fewer than three notes" while the guard is `cand.length > 1` over notes with
  `step > 0` — not the same predicate.

---

## 11. THE SHORT LIST — what this sheet actually asks the program to do

Nothing here is a wish; each is a measurement or a named source, in the order
they cost.

Nothing here is a wish. Each is a measurement or a named source. **The first
four are defects found by measurement and outrank the rest.**

| # | what | why |
|---|---|---|
| **1** | **`ds2` declares no `theme` and inherits dungeonsynth's whole melodic program** | §10d. 40/40 seeds byte-identical on every pitched line. Two of the file's five genres are one tune-writer. Any melodic statistic reported for both — in this sheet and in `MELODIC-MATH-ENGINE.md` — is one number counted twice. `fantasysynth` shows the correct pattern at :30226. |
| **2** | **`noRepeat` is read through four gates and the two covering the record are dead** | §10e. 4.5% repeated pitches in the performance against 0.0–1.1% in the material; 385 in one record. The file's own comments document this failure twice and it recurred. This is the owner's six-times-reported complaint, still live where it is heard. |
| **3** | **L5 is not built — 95.8% of lead movements are independent draws** | §10h. 400 stated against 9,062 drawn. `moveBias` reaches themeB only and is capped at four entries. The law the engine doc calls load-bearing forbids exactly what the program does. |
| **4** | **The break removes an instant, not a note** | §10i. 17 records of 199 lose two notes. And its guard is not the predicate §8b describes. |
| 5 | **Eleven of §5's fourteen dials are engine literals, one set for all five genres** | §10f. Nine grep to zero; `alterHead` and `freeTail` do not exist. Consequence in §10g: between-genre separation is 0.07–0.23 of within-genre spread on four of six melodic dials. **The records differ; the genres do not.** |
| 6 | **Give `theme.moves` its measured numbers, and reconsider the default** | §3b, §10a. The table is built; two regions declare one. The default's 78% directional inertia is above every measured corpus. Every genre's lead currently means 2.65–2.92 semitones — Essen's 2.8 — including the pop-facing ones, against Billboard's 3.8. |
| 7 | **Give `away` a measured target** | §6. 50–71% of long-range repetition is literal in rock; the dial has none, and is 0.55 everywhere. |
| 8 | **Adopt an interval n-gram similarity measure in `mk2_score.js`** | §5d. Two independent lines converge on n-gram-5 count-distinct. |
| 9 | **Mark augmentation `[theory]`, not corpus** | §5a. **No experiment measuring recognition under proportional duration scaling was found.** Material C rests on pedagogy alone. |
| 10 | **Correct the four drifted headline numbers** | §10b. 88→87, bass 69→41, "all fifty"→19 of 50, and the break's 26/40 holds only at its own sample size. The controls reproduce; the after-numbers were rounded up. |
| 11 | **Fix `melodic-math.md:53`** — the movement unit is scale steps | §1. One line, and it misleads anyone who reads it. |
| 12 | **Relabel the *Smoke On The Water* mode**, and note the parallel-fourths reading | §1. The arithmetic stands; the label does not. |
| 13 | **Do not build post-skip reversal or gap-fill** | §4a. Real statistic, false mechanism. Encode range. |
| 14 | **Fix or retire the `+1.5 st` provenance** | §9. It names no document. |

**And one that is not a defect but is the largest thing here.** §10c: the lead's
second half is still a bar-for-bar **rhythm** copy of its first in **152 of 199**
records, because `displace` preserves the rhythm by design and the answering
phrase borrows the question's rhythm 100% of the time in every genre. The
headline 87 counts pitch *and* rhythm and so reads as progress. Against
`melodic-math.md` §1 — *"a motif is recognised by its RHYTHM; its pitches are
free"* — the program is varying the dimension the sheet calls free and holding
the one it calls the identity. That may be right. It is not what §1 describes,
and nothing in the file has noticed the difference.

---

## Sources

**Corpus and experiment — read directly**

- Chiu & Temperley 2024, *Music & Science* — step inertia across five corpora,
  mean interval sizes. https://journals.sagepub.com/doi/full/10.1177/20592043231225731
- Temperley 2014, *Music Perception* 31(4) — cross-entropy tables, the
  interval × scale-degree double-count, the Gaussian model.
  https://davidtemperley.com/wp-content/uploads/2015/11/temperley-mp14.pdf
- Temperley 2024, *Empirical Musicology Review* 18(2) — intervallic repetition,
  distance law, metric parallelism, Rolling Stone subset.
  http://davidtemperley.com/wp-content/uploads/2026/06/temperley-emr24.pdf
- Huron 2001, *Music Perception* 19(1) "Tone and Voice" — ten-culture interval
  distributions; the step/leap boundary is scale-relative.
  https://www.musanim.com/articles/Huron.ToneAndVoice.2001.pdf
- Frieler, "A feature history of jazz improvisation" — Weimar Jazz Database.
  https://www.mu-on.org/frieler/docs/frieler_feature_history_final_preprint.pdf
- Tierney, Russo & Patel 2011, *PNAS* 108 — 9,467 Essen songs / 52,899 phrases;
  arch and descent, p < 0.0001. https://pmc.ncbi.nlm.nih.gov/articles/PMC3174665/
- Cornelissen, Burgoyne, Honing & Zuidema 2026, arXiv:2604.13119 — "melodic
  contour does not cluster"; the hidden ε in Huron's typology.
  https://arxiv.org/pdf/2604.13119
- Janssen, Burgoyne & Honing 2017, *Frontiers in Psychology* — what survives oral
  transmission. https://pmc.ncbi.nlm.nih.gov/articles/PMC5403935
- Volk & van Kranenburg 2012, *Musicae Scientiae* 16(3) — 360 melodies, 104 motif
  classes. https://doi.org/10.1177/1029864912448329
- Uitdenbogerd & Zobel, ISMIR 2000 — contour vs interval over 10,466 MIDI files.
  https://archives.ismir.net/ismir2000/poster/000014.pdf
- Müllensiefen & Pendzich 2009, *Musicae Scientiae* — 20 plagiarism cases; no
  note threshold. https://research.gold.ac.uk/id/eprint/5382/
- Müllensiefen & Frieler 2004, *Computing in Musicology* 13 — 34 similarity
  measures against human ratings. https://www.academia.edu/4125197/
- Dai, Yu & Dannenberg 2022, arXiv:2209.00182 — repetition and vocabulary on
  POP909 and PDSA. https://arxiv.org/abs/2209.00182
- Dai, Zhang & Dannenberg, arXiv:2010.07518 — phrase-length and repetition
  statistics, POP909. https://ar5iv.labs.arxiv.org/html/2010.07518
- Van Balen, Burgoyne, Wiering & Veltkamp, ISMIR 2013 — 6,462 Billboard sections;
  chorusness features. https://archives.ismir.net/ismir2013/paper/000180.pdf
- Le, Bigo & Keller 2025, arXiv:2501.04630 — the intervalization ablation.
  https://arxiv.org/abs/2501.04630
- Geary 2024, *MTO* 30.2 — 100 pop songs, drum-pattern variation statistics.
  https://mtosmt.org/issues/mto.24.30.2/mto.24.30.2.geary.html

**Perception**

- Dowling 1972, *Perception & Psychophysics* 12(5):417–421 — inversion .70,
  retrograde .64, RI .55. https://labs.utdallas.edu/mpac/files/2021/03/1972.pdf
- Dowling & Fujitani 1971, *JASA* — contour vs interval.
  https://www.brainmusic.org/EducationalActivities/DowlingFujitani_1971.pdf
- Dowling 1978, *Psychological Review* 85:341–354 — scale + contour model.
- Dowling & Bartlett 1981, *Psychomusicology* 1:30–49 — interval retained in LTM.
  https://psycnet.apa.org/record/1982-09517-001
- Edworthy 1985, *Music Perception* 2(3):375–388 — contour early, interval later.
  https://wrap.warwick.ac.uk/id/eprint/111835/
- Krumhansl, Sandell & Sergeant 1987, *Music Perception* 5(1) — mirror forms,
  large individual differences. https://online.ucpress.edu/mp/article-abstract/5/1/31/62868/
- von Hippel & Huron 2000, *Music Perception* 18(1):59–85 — post-skip reversal is
  regression to the mean. https://online.ucpress.edu/mp/article/18/1/59/62088/
- von Hippel 2000b, *Music Perception* 18(2) — gap-fill unused by listeners.
- Schellenberg 1997, *Music Perception* 14(3) — two-factor simplification of
  Narmour.
- Schmuckler & Moranis 2023, *Attention, Perception & Psychophysics* 85 — rhythm
  has a contour. https://link.springer.com/article/10.3758/s13414-023-02700-w
- Hébert & Peretz 1997, *Memory & Cognition* — melody a better LTM cue than
  rhythm. https://link.springer.com/article/10.3758/BF03201127

**Systems and representations**

- Nierhaus 2009, *Algorithmic Composition* (Springer) — the standard survey.
- Gillick, Tang & Keller 2010, *Computer Music Journal* — Impro-Visor grammar;
  chord tones outrank slope bounds. http://ai.stanford.edu/~kdtang/papers/cmj10-jazzgrammar.pdf
- Biles, GenJam — scale-degree genes; invert rescales into range.
  https://genjam.org/wp-content/uploads/2019/07/genjamasa97.pdf
- Cope's EMI via da Silva 2003 — signatures = 1–8 contiguous melodic intervals.
  https://www.academia.edu/91797327/
- Assayag et al. 2006, OMax — factor oracle over slices with harmonic labels.
  http://articles.ircam.fr/textes/Assayag06b/index.pdf
- Ebcioğlu 1988/1990, CHORAL. https://www.sciencedirect.com/science/article/pii/074310669090055A
- Lattner, Grachten & Widmer 2018, ISMIR — relative pitch, sparsity, copy-and-
  shift. https://arxiv.org/abs/1806.08686
- Rafraf 2021, arXiv:2108.10449 — interval encoding → "excessive modulations".
- Mozer 1994, *Connection Science* (CONCERT) — note-by-note prediction lacks
  global coherence.
- Humdrum `**mint` (melodic intervals, with embedded pitch offsets) and `**deg`
  (key-relative scale degree). https://www.humdrum.org/rep/mint/ ·
  https://www.humdrum.org/rep/deg/
- MidiTok `use_pitch_intervals`. https://miditok.readthedocs.io/en/latest/configuration.html
- Parsons 1975, *The Directory of Tunes and Musical Themes*.
- Adams 1976, *Ethnomusicology* 20(2) — 15-type contour typology.
  https://www.hugoribeiro.com.br/biblioteca-digital/Adams-Melodic_Contour_Typology.pdf

**Motif transformation, asserted**

- Schoenberg, *Fundamentals of Musical Composition* (1967) and *Style and Idea*
  (1984) — developing variation, and the attack on unvaried sequence.
- Caplin, *Classical Form* (1998) — fragmentation vs liquidation.
- Open Music Theory — inversion, retrograde, displacement, intervallic
  manipulation. https://viva.pressbooks.pub/openmusictheorycopy/chapter/foundational-concepts/
- Lehman 2023, *Complete Catalogue of the Themes of Star Wars* — micro/macro
  transformation taxonomy. https://franklehman.com/wp-content/uploads/2023/06/Star-Wars-Thematic-Catalogue.pdf
- Butler 2006, *Unlocking the Groove* / Butler 2001 *MTO* 7.6 — EDM rhythm and
  metrical dissonance.
- Epstein 1986, *Musical Quarterly* LXXII/4 — *Piano Phase* pattern and process.

**Melodic math, the external doctrine**

- Seabrook, *The Song Machine* (2015), ch. 21 "Melodic Math" — origin of the term.
- Rami Yacoub, *Music Week* interview — "we never start writing by implementing
  the melodic math." https://www.musicweek.com/talent/read/rami-yacoub-on-writing-pop-classics-melodic-math-and-his-quest-for-the-perfect-studio-sound/083686
- Max Martin, *Di Weekend* 2017, via NME. https://www.nme.com/blogs/max-martin-interview-perfect-pop-song-1996673
- Peres, Top40 Theory. https://www.top40theory.com/melodic-math-course

**Verification of the sheets' own examples**

- Musicnotes, "The Final Countdown" — F♯ minor.
  https://www.musicnotes.com/sheetmusic/europe/the-final-countdown/MN0179327
- Wikipedia, "Smoke on the Water" — G minor blues melody in parallel fourths.
  https://en.wikipedia.org/wiki/Smoke_on_the_Water
- Serna, guitarmusictheory.com — the modal reading of the chorus.
  https://www.guitarmusictheory.com/smoke-on-the-water-guitar-chords/

---

## Explicitly unverified

Recorded so the next reader does not spend the fetch, and so nothing here is
mistaken for measured.

- **"≈72% of large leaps are followed by a reversal"** (attributed to von Hippel
  & Huron 2000). Appeared in search summaries in two independent passes; neither
  could verify it against the paper. **Do not use.**
- **Li & Huron 2006** (scale degree vs interval) — full text 403 in both passes;
  two secondary summaries state the direction of the result in **opposite ways**.
  Unresolved.
- **Bonnie McKee's syllable quotes** — consistent across secondary sources, never
  seen on a primary page.
- **The Savan Kotecha SXSW 2017 quote** — source page now 404. Do not quote.
- **Recognition of augmentation/diminution** — searched for specifically; **no
  experiment measuring recognition under proportional duration scaling was
  found.** This is a hole in the literature, not a search failure.
- **No cell-count data for electronic/EDM melody** exists in the searched
  literature.
- **Huron 1996's exact contour-type percentages**; Downie's retrieval precision
  figures; Ghias et al.'s "10–12 transitions"; Schellenberg's sr² values; Vos &
  Troost's corpus composition; Dalla Bella 2003's gating note counts.
- **The Essen corpus size is cited inconsistently across papers** (3,786 / 6,208 /
  9,467 / "over 8,000") — these are different subsets, not one canonical corpus.
  Any per-corpus statistic must name its subset.
- Krumhansl 2010 "Plink" (400 ms recording recognition) is **off-target** — it
  measures recognition of *recordings*, timbre and production included, not
  melodic identity. Do not cite it as a motif threshold.
