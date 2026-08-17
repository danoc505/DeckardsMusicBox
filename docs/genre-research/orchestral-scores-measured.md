# ORCHESTRAL FULL SCORES, MEASURED — `2026-08-17`

*[owner] "Can you use the web and find some scores of orchestra full scores and
study them."*

Not page images — **scores I can measure**. 96 orchestral movements, machine
readable, CC0, transcribed from public-domain IMSLP editions.

---

## THE CORPUS

**[MarkGotham/Hauptstimme](https://github.com/MarkGotham/Hauptstimme)** — the
*OpenScore Orchestra* corpus plus *Hauptstimme* annotations. Code MIT
(© 2025 Mark Gotham); the scores are CC0, transcribed from *"clearly identified
and unequivocally public source editions on IMSLP"*. [Zenodo record](https://zenodo.org/records/15425749)

| composer | works | movements |
|---|---|---|
| Beethoven | complete symphonies 1–9 | 37 |
| Brahms | complete symphonies 1–4, *Ein deutsches Requiem* | 17 |
| Bach | B minor Mass, Brandenburgs 3 & 4 | 33 |
| Bruckner | Symphony No.5 | 4–5 |
| Beach, Amy | Symphony in E minor (*Gaelic*), Op.32 | 4 |
| Haydn | Symphony No.104 | 1 |
| Schubert | Symphony No.5 | 1 |
| Boulanger, Lili | *D'un matin de printemps* | 1 |

**Why this corpus and not IMSLP PDFs.** Three files per movement make the
questions answerable at all:

- `_annotations.csv` — *"where the main theme is"*, hand-analysed: `qstamp,
  measure, beat, label, part, instrument`. **Which instrument has the tune, at
  every moment.**
- `_part_relations.csv` — for every annotation block, what each of the ~17 parts
  is doing relative to the main one: `U()` unison, `P8()` octave, `P3()`, `P5()`.
- `.csv` — the highest pitch in each part at every change.

**What was taken, for the ledger:** counts and rates only — how often the theme
changes hands, how many parts double it, how many rest. No melody, no pitch
sequence, nothing reconstructible. Consistent with `LICENSING.md`: *"store only
relative/abstract material… never a recognizable whole melody."*

---

## 1. FIVE THEMES RUN A WHOLE MOVEMENT — and our count is already right

96 movements, every annotation block:

```
annotation blocks per movement       mean 106   median 90
DISTINCT THEME LABELS per movement   mean 5.9   median 5    max 27
times each theme is stated           mean 25.0
```

**A symphony movement runs on about five ideas, each stated twenty-five times.**
Amy Beach's *Gaelic* finale: **280 statements, FOUR themes.** Beethoven 9's first
movement: 276 statements, five themes.

Our record, asked the same question, is **5.6 themes**. That number is right and
was right before today. The material budget was never the fault.

---

## 2. AND IT CHANGES HANDS EVERY 1.28 STATEMENTS

```
DISTINCT INSTRUMENTS carrying the theme   mean 9.1   median 9   max 21
statements before it CHANGES HANDS        mean 1.28  median 1.25
share of statements that HAND OVER        76.0%
```

Beethoven 5, the first seventeen bars, straight off the annotation file — the
same label `a` every time:

```
qstamp   label   part
0.5      a       Vln 1
4.5      a       Vln 1
10.5     a       Vln 2
12.5     a       Vla
14.5     a       Vln 1
18.5     a       Vln 2
20.5     a       Vla
22.5     a       Vln 1
```

**This is the answer to the objection that killed the four-bar loop.** The
`materialBars: 8` comment argued *"a 4-bar cell came round 43.3 times in a
173-bar record, and no writing survives forty-three hearings."* Beethoven's
survives twenty-five hearings a movement and Amy Beach's survives seventy —
because **three quarters of those hearings are in a different instrument.**

The thing that makes repetition bearable is not variation of the notes. It is
**re-orchestration**.

### 2a. OUR RECORD, THE SAME FOUR QUESTIONS

8 seeds, 20 minutes each, one statement = one pass of the loop:

| | boxcar synth | 96 orchestral movements |
|---|---|---|
| statements | 86 | 106 |
| **distinct themes** | **5.6** | **5.9** ✓ |
| **instruments carrying the theme** | **2.9** | **9.1** |
| **statements before it changes hands** | **21.4** | **1.28** |
| **% of statements that hand over** | **4%** | **76%** |

**The tune stays in one pair of hands for twenty-one statements while the
orchestra hands it over every one and a quarter.** That is the fault, it is a
factor of seventeen, and it is not a fault anyone has named in this project
before — every previous diagnosis was about the notes.

---

## 3. FIFTY-NINE PER CENT OF THE ORCHESTRA IS RESTING

11,219 blocks across 94 movements:

```
parts in the score                  17.3 mean
PARTS SOUNDING in a block            7.1     ->  59% RESTING
parts RELATED to the main part       7.7 mean, median 7
how they relate:  P8 51%   unison 19%   P3 16%   P4 7%   P5 5%   P6 4%
```

Two things follow, and the second is the surprise:

1. **Doubling is the norm, and it is octaves.** When the theme sounds, about
   eight parts are on it — 70% of those at the octave or in unison. That is not
   "the tune plus accompaniment"; it is the tune played by a crowd.
2. **Over half the band is silent at any moment.** Against this, the standing
   complaint that *"the band is 5.1 at cruise, and eight seats were declared"*
   (#145) reads the wrong way round: 5.1 of 8 is **64% sounding**, against an
   orchestra's **41%**. **Our band is too full, not too empty.**

---

## 4. WHAT THIS CHANGES

**The lever is the handover, and the machinery already exists.** `ride.leads`
declares three instruments, the lead lane has a `ladder` and a `swap` coin, and
the arrangement seats parts per section. It fires on 4% of statements. Nothing
new has to be built — a rate has to be right.

Ranked by measured distance from the corpus:

1. **The theme changes hands** — 4% → toward 76%, drawn from the genre's own
   lead pool, at statement boundaries. **The single largest gap in the file.**
2. **Doubling at the octave when the tune matters** — P8 51% / U 19% is what a
   loud moment is made of, and `doubling` already exists (#50) but is drawn as
   an occasional decision rather than as the texture of a peak.
3. **Thin the band** — 41% sounding, not 64%. Subtraction, which
   `LOOP_TO_SONG.md` §1 already named as the primary arrangement verb and which
   this measurement now puts a number on.

Tasks **#167** (the handover), **#168** (octave doubling at the peak), and #145
re-read in the light of §3.

None of these is a change to the notes. **Every previous session's diagnosis was
about the notes**, and the corpus says the notes were roughly the right count
all along — 5.6 themes against 5.9.

---

## 5. WHAT THIS CORPUS CANNOT SETTLE

- **The annotations are one analyst's reading.** The repo's own
  `docs/annotation.md` says so. "Where the main theme is" is a judgement, and
  76% is a measurement of *that judgement* applied consistently, not a physical
  constant.
- **It is 1720–1910 concert music.** A string band on a freight train is not a
  symphony orchestra, and the handover rate of one is a starting point for the
  other, not a target to hit exactly.
- **Dynamics are not measured here.** They are in the `.mscz` and would need
  MuseScore to extract, which is not installed. Task #157 stands on the
  program's own numbers (under 4 dB) and has no corpus reference yet.
- **Nothing about rhythm yet.** The `.csv` gives the highest sounding pitch per
  part per change, not durations, so #156 is untouched by this pass. The `.mxl`
  files would answer it and were not parsed.
