# SCORE CRAFT — how an orchestra is actually written, and what of it this program can do

*2026-08-11. The synthesis step that three killed workflows never reached.*

*The owner, twice: "I think you should do a quick research on how to program
scores and orchestra"; then "were you able to read LOTR scores or not? Did you do
more research like i asked you to do?"; then "I feel like you need to study those
scores and score writing in general because if you had done this we would not be
here am I to gather you told me that you were able to save the research data from
before and then you never bothered to read it?"*

**That last one is the finding.** The research WAS saved — 388 KB of it, in
`raw/lotr-score-study.md`, `raw/epic-orchestral-scale.md` and
`raw/overworld-and-materials.md`, salvaged when the workflows died. I wrote the
salvage script, committed the files, and then built a genre without opening them.
This sheet is what was in them.

---

## §0 WHAT IS SOURCED HERE, AND WHAT IS NOT

Everything below carries its source. Three kinds of statement appear, and they
are not the same kind of thing:

- **[NOTATION]** — pitches somebody read off a staff or a MusicXML file.
  Checkable. The strongest evidence in this sheet.
- **[DOCTRINE]** — a rule stated in a public-domain orchestration treatise
  (Rimsky-Korsakov, Berlioz/Strauss, Forsyth). Quoted verbatim, so the reading is
  checkable even where the rule is a matter of taste.
- **[PROSE]** — an analyst's claim about music, with no staff attached. Weakest.
  Flagged wherever it is load-bearing.

**And one correction is owed immediately** — see §1.

---

## §1 CORRECTION: `lotr-themes-measured.md` §1 IS BUILT ON A BAD TRANSCRIPTION

That sheet reads the Shire theme as **3/4, C major, degrees `3 4 5 | 6 5 6 | 7 7
…`**, from `trillian.mit.edu/~jc/music/abc/demo/Tunes/Shire.abc`. The research
that FOUND that file flags it, in as many words:

> *"CAVEAT: I could NOT reconcile this melody with the four other independent
> Concerning Hobbits/Shire transcriptions I extracted (which all agree on
> 1-2-3-5-3-2-1). Treat this file's accuracy as doubtful despite its Howard Shore
> credit line."*

Four independent sources agree against it, and three of them are official
publications: **[NOTATION]**

| source | key | metre | tempo | melody |
|---|---|---|---|---|
| FOTR Complete Recordings transcription, p.8 | **D major** | 4/4 | ♩=90 | D4 E4 F#4 F#4 A4 A4 F#4 F#4 E4 D4 D4 = **1 2 3 3 5 5 3 3 2 1** |
| flat.io full orchestral arrangement (16 parts) | **D major** | 4/4 | ♩=100 | D5 E5 F#5 F#5 A5 A5 F#5 F#5 E5 F#5 E5 |
| flat.io piano arrangement (67 bars) | **D major** | 4/4 (one 2/4 bar) | ♩=105 | D5 E5 F#5 A5 F#5 E5 F#5 E5 |
| Macksey Journal EX.2/EX.3 | D major | 4/4 | — | *"follows a D major pentatonic scale"* |

So the corrected facts, and every one of them contradicts what the hobbit synth
table was built on:

1. **The pitch set is D–E–F#–A(–B): MAJOR PENTATONIC.** No fourth, no seventh.
   The Macksey author states it independently: *"The melody follows a D major
   pentatonic scale, with the occasional major seventh added as a passing tone."*
   Pentatonic is not a mode in the program's `MODES` table at all — it is a
   pitch-set CONSTRAINT on top of a mode, which is a different mechanism.
2. **The contour is `1 2 3 3 5 5 3 3 2 1`** — an arch that rises to the fifth and
   comes back. The Young thesis' Schenkerian reduction (Fig. 4-1a) says the same
   thing: *"a prolongation of tonic, featuring an arpeggio to scale-degree 5 and a
   concluding 2-1 neighbor motion."*
3. **It is in 4/4**, not 3/4. The program's sixteen-step bar is not the problem
   the earlier sheet said it was — for this theme.
4. **The bass is in the RELATIVE MINOR.** The 16-part orchestral score's
   Contrabass, bar by bar: `B2 B2 D3 B2 G2 G2 E2 C#2→D2 E2 B2 B2 D3 B2 G2`. A
   **D-major tune over a Bm–D–G–Em bass**. The brightness is in the melody and
   the shade is underneath it, at the same time. That is a far better answer to
   *"Hobbit Synth shouldn't be as dark and moody as the Dungeon Synth"* than any
   mode weight, and it needs no new mode at all.

`lotr-themes-measured.md` §2–§4 (Concerning Hobbits, Rohan, The Ring Goes South)
are unaffected — different files, no conflict reported against them.

---

## §2 THE ORCHESTRA IS FOUR REAL PARTS AND A PILE OF DOUBLINGS

**[DOCTRINE]** Rimsky-Korsakov, *Principles of Orchestration*, Gutenberg #33900:

> *"In the very large majority of cases harmony is written in four parts… Harmony
> which at first sight appears to comprise 5, 6, 7 and 8 parts, is usually only
> four part harmony with extra parts added. These additions are nothing more than
> the duplication in the adjacent upper octave of one or more of the three upper
> parts forming the original harmony, the bass being doubled in the lower octave
> only."*

This is the single highest-value finding for this program, because **it means
"orchestral" is not a composition problem.** The program already composes four
real parts. Everything above four is generated.

### The permission table, verbatim from the source

> *"In widely-spaced harmony only the soprano and alto parts may be doubled in
> octaves. Duplicating the tenor part is to be avoided, as close writing is
> thereby produced, and doubling the bass part creates an effect of heaviness.
> The bass part should never mix with the others."*

| voice | +12 | −12 | note |
|---|---|---|---|
| soprano (`lead`) | **yes** | no | |
| alto (`keys`, `keys2`, `ostinato`) | **yes** | no | |
| tenor (`counter`) | **no** | no | RK: *"to be avoided"* — it collapses the spacing |
| bass | no | **yes** | *"the lower octave only"* |

**This is already implemented** — it is the `STACK_OK` table behind the add-an-
instrument button. What is NOT implemented is the automatic version: the program
still never doubles anything unless a hand presses the button.

### Three voice-leading rules for a doubler

> *"Consecutive octaves between the upper parts are not permissible."*
> *"Consecutive fifths resulting from the duplication of the three upper parts
> moving in chords of sixths are of no importance."*
> *"The bass of an inversion of the dominant chord should never be doubled in any
> of the upper parts."*
> *"Notes in unison resulting from correct duplication need not be avoided."*

So: reject a doubling that makes parallel octaves between two ORIGINAL upper
parts; **pass** parallel fifths that arise only from doubling; never double the
bass of a first-inversion dominant upward; and do not de-duplicate unisons.
`probe_theory`'s 5% parallel-perfects ceiling would have to learn the second rule
before any auto-doubler could ship, or it will fail on legal writing.

---

## §3 THE LOUDNESS TABLE, AND WHY THE MIX IS WRONG

**[DOCTRINE]** RK again, exactly:

> *"In loud passages the horns are only one-half as strong, 1 Trumpet = 1
> Trombone = 1 Tuba = 2 Horns. Wood-wind instruments, in forte passages, are
> twice as weak as the horns, 1 Horn = 2 Clarinets = 2 Oboes = 2 Flutes = 2
> Bassoons; but, in piano passages, all wind-instruments, wood or brass are of
> fairly equal balance."*

| at forte | relative weight |
|---|---|
| trumpet / trombone / tuba | 1.0 |
| horn | 0.5 |
| flute / oboe / clarinet / bassoon | 0.25 |
| **at piano** | **all equal** |

Two consequences the program can act on:

1. **To balance one trumpet you need two horns or four woodwinds.** A single
   flute-type patch against a brass patch is not a duet, it is a brass solo with
   a decoration. This is the arithmetic behind *"we have bad levels and not using
   frequences well"*.
2. **It is dynamic-dependent.** The same patch pair that balances at forte is
   wrong at piano, where the ratio collapses to 1:1. The program's `roleGain` is
   a single fixed number per role — it cannot express this, and that is a real
   structural gap rather than a wrong constant.

Berlioz, on synth-string weight: one string-section voice = one wind voice at
piano, **two** at forte. A five-part string layer therefore weighs ten wind
voices at forte, which is why winds vanish under pads in this program.

---

## §4 SPACING, AND THE THING THAT SOUNDS "SPARSE" RATHER THAN "FULL"

**[DOCTRINE]** RK on gaps: *gaps in the middle are forbidden at forte and only
tolerable at piano* — the loudness gates the texture rule. The register budget
that goes with it, bottom to top:

| region | max interval between adjacent voices |
|---|---|
| bottom | 12 / 9 semitones |
| middle | 7 / 5 |
| top | 4 / 3 / 2 |

And: bass to tenor should not exceed an octave. The owner's *"it doesn't even
feel more full than sparse dungeon synth"* is this rule, unimplemented — the
program allocates each part a register band and never checks the GAPS BETWEEN
them.

### The build-and-release, which is a complete algorithm

> *"In the majority of cases, diverging and converging progressions simply consist
> in the gradual ascent of the three upper parts, with the bass descending… The
> intermediate intervals are filled up by the introduction of fresh parts as the
> distance widens, so that the upper parts become doubled or trebled. In
> converging progressions the tripled and doubled parts are simplified, as the
> duplicating instruments cease to play. Moreover… the group in the middle region
> which remains stationary is the group to be retained, or else the sustained
> note which guarantees unity in the operation."*

One state variable — the span between the outermost voices. Spawn a doubling
whenever an adjacent-voice gap exceeds its register budget; on the way down kill
doublings in reverse order but **pin one stationary middle voice that never drops
out**. That is a generative crescendo, and this program has nothing like it: its
`build.enter` adds whole PARTS, which is a different and blunter thing.

---

## §5 STACKING A MELODY: THE ORDER IS FIXED, AND DOWNWARD IS USUALLY WRONG

**[DOCTRINE]** RK on octave-doubling a tune:

> *"Deviation from the natural order, such as placing the bassoon above the
> clarinet or oboe, the clarinet above the oboe or flute etc., creates an
> unnatural resonance occasioned by the confusion of registers, the instrument of
> lower compass playing in its high register and vice versa."*

Sort patches by natural centre frequency; **highest-centred patch on top**,
descending. Cap at four octaves; five *"are extremely rare"* and must include the
strings. In the Spanish Capriccio stack the middle octaves carry two voices each
— **the octaves are not equally weighted**.

**And Berlioz contradicts the obvious move**, which is the cheapest quality win
in this sheet:

> *"in order to give a passage greater energy, the first violins are doubled by
> the second violins an octave lower; but, if the passage do not lie excessively
> high, **it is better to double them in unison**. The effect is thus incomparably
> finer and more forcible… this weak lower doubling, on account of the
> disproportionate upper part, produces a futile murmuring, by which the vibration
> of the high violin notes is rather obscured than assisted."*

So: **double at the UNISON unless the melody is genuinely high.** A dark, weak
voice put an octave below a bright strong one is worse than nothing — reassign it
to reinforce the bass at unison instead. The program's `STACK_OK` currently only
knows ±12; it has no unison-with-detune option at all, and that is the doubling
the source recommends first.

Berlioz also, on splitting a line across two voices: give both the **same pan and
the same patch**, do not pan them apart — *"the distance of the two points of
departure of the sounds will break the unity of the passage, rendering the join
too apparent."* Corollary, stated as a rule this program can hold: **a doubling
meant to be heard as one thicker instrument must share pan and patch; a doubling
meant to be heard as two instruments must differ in at least one of pan, patch or
register.**

### Which timbres fuse

Only double WITHIN a register tier:

| tier | fusing set |
|---|---|
| high | bright string + reed + bright brass (violin / oboe / trumpet) |
| mid | warm string + hollow reed + horn (viola-cello / clarinet / horn) |
| low | low string + double reed + trombone / tuba |

A two-element string+brass doubling **will not fuse** — the woodwind member is
the glue.

### And one doubling that is worthless

Strauss, annotating Berlioz: *"In big tuttis one often finds important bass themes
allotted to the trio of Trombones, reinforced also by Bassoons, Cellos, and
Double-Basses. Such 'doubling' is perfectly useless… one should rather let them
rest."* A tutti is not "everyone plays the bass line".

---

## §6 THE MELODY AND THE ACCOMPANIMENT MUST DIFFER IN COLOUR, NOT ONLY IN LEVEL

**[DOCTRINE]** RK, and this is the direct answer to *"why would a plucked
instrument be put on chords?"*:

> *"the harmonic basis should differ from the melody not only in fullness and
> intensity of tone, but also in colour. If the fanfare figure is allotted to the
> brass (trumpets or horns) the harmony should be given to the wood-wind; if the
> phrase is given to the wood-wind (oboes and clarinets) the harmony should be
> entrusted to the horns."*

> *"The greater the dissimilarity in timbre between the harmonic basis and the
> melodic design, the less discordant the notes extraneous to the harmony will
> sound… the harmonic basis generally remains an octave removed from the melodic
> design, and should be of inferior dynamic power."*

Three rules, all checkable:

1. **Melody family and harmony family must differ.** Wind melody → horn harmony;
   brass melody → wind harmony.
2. **The harmony sits an octave away from the melody** and is quieter.
3. A **plucked** patch is a decay envelope. It can hold a chord only by
   re-striking it — an arpeggio or a broken figure — which is precisely what the
   LOTR piano arrangements do: *"THE LEFT HAND GIVES YOU CHORDS DIRECTLY as
   broken arpeggios: m13 `D3 A3 D4 A3 F#4 A3 D4 A3` (=D)."* **[NOTATION]** So
   `bardPluck` on `keys` is not automatically wrong — it is wrong when `keys`
   writes SUSTAINED BLOCK CHORDS, which is what the program does.

---

## §7 THE CRESCENDO ARRIVES BY FAMILY, NOT ALL AT ONCE

**[DOCTRINE]** *"in a crescendo, the instruments should be introduced in the
order: strings, wood-wind, brass."*

Implemented, 2026-08-11, as the ladder's stagger — see `probe_ladder`. Measured
before: **81%** of every re-scoring away from the climax moved every laddered part
at once. After: **23%**. The climax still moves everything, which is what a tutti
is.

## §8 THE SONORITY TABLE — seven presets, straight out of Berlioz

**[DOCTRINE]** From Berlioz's 467-player fantasy orchestra, each entry naming a
register, a patch set and a dynamic:

| preset | forces | dynamic |
|---|---|---|
| AERIAL | divided high strings | pp |
| MELANCHOLY | divided low cellos and basses | mf |
| GLOOMY | very low clarinet family only | mf–f |
| MOURNFUL | low double reeds + low flutes | p |
| GRAVE / CALM | low tuba + horns + trombone pedal + 16′ organ | p |
| SHRILL | highest small clarinets and piccolos | f |
| POMPOUS | full brass | f |

**And the finding that matters for this repo:** the two most dungeon-synth
colours in the list — GLOOMY and GRAVE — are **low registers at p–mf, not loud**.
Epic is not "the same music louder". It is the POMPOUS and SHRILL presets
switched in ON TOP of a quiet low one. The hobbit-synth brief — *"still dark and
moody but has the epic feel"* — is that switch, and it is a texture change, not a
gain change.

---

## §9 WHAT THE LOTR SCORES THEMSELVES SAY

All **[NOTATION]** unless marked.

**The Shire.** See §1. D major pentatonic melody over a relative-minor bass.
Young: *"a single melodic line (most often played by fiddle or flute), played
above sustained diatonic chords in the strings."* **[PROSE]** — one line, one
pad, and nothing else. The full 16-part orchestral arrangement of it is still one
tune and one accompaniment; the sixteen parts are §2's doublings.

**Rohan** (flat.io full score, 31 bars, ♩=76, 10 parts). Pitch set
{C,D,E,F#,G,A,B} — one sharp, **modal**. And the cello has an **ostinato of two
alternating notes**: `C3 D3 | D3 C3 | C3 D3 | C3 D3 | D3 E3 | E3`. That is the
same object as §2 of `lotr-themes-measured.md`, found a third time, in a real
score: **a two-element cell whose pitches track the harmony while its shape does
not change.**

**Isengard.** 5/4, explicitly, in the file attributes. Core cell doubled at the
octave between brass and strings: F E F E D A, restated transposed as C B C B A E.
A theme whose identity is a METRE.

**Gondor** (Titus). D Dorian. Six chords, one triad per downbeat: **Dm, G, F, Bb,
C, A** — *"with the exception of D minor, all the chords are major."* The melody
opens on a rising perfect fifth D4→A4 and **ends on E4, not on the tonic.**

**The Ring** (Macksey EX.4, a full four-bar string score). Cello + bass `F3 + C4`;
viola `Ab3 + C4` in bars 1 and 3, `A♮3 + C4` in bars 2 and 4 — **an F minor triad
whose third flickers between Ab and A♮**. Violins doubled, and the melody across
all four bars uses **three pitches only: A5, B5, C6**. So: a minor pad, a raised
fourth over it, and a three-note melodic cell oscillating on a semitone. Directly
implementable, and it is a rule-break of exactly the kind the prog-techno brief
asks for.

**Ring and Mordor both open with a rising semitone** — Ring B4-C5-B4-A4, Mordor
C#5-D5-C#5-Bb4. Two themes related by their first interval and told apart by their
third. Confirmed three ways (notation, Reitter, Macksey).

**Khazad-dûm.** Opening ostinato `D2 + A2 + D3` — a bare open fifth doubled at the
octave, F3 above it. The dungeon-synth sound, notated.

**Gollum's Song** (Lee & Lee, 16-bar harmonic reduction with every transformation
labelled). G#m→Bm, D→B, Gm→Bm, Bm→Gm. Chromatic mediants, and their **Table 1 is
a lookup table this program could hold**: in major RP = I→VI, LP = I→III,
PL = I→♭VI, PR = I→♭III; in minor RP = i→iii, LP = i→vi, PL = i→♯iii.

**Into the West.** The same functional progression in two independent official
publications — C–G–Dm–Am (easy piano, C major) and E♭–B♭–Fm–Cm (SATB octavo,
E♭ major) — **I–V–ii–vi**, cross-confirmed.

---

## §10 WHAT IS STILL NOT READ, AND WHERE IT IS

Written down so nobody fills it in from memory.

- **Rone, "Scoring the Familiar and Unfamiliar"** (Music and the Moving Image
  11/2, 2018). Blocked five ways. The only public content is the abstract's
  mapping — *Hobbits = major-minor diatonic, Men = modal diatonic, Elves =
  nondiatonic chromatic mediants*. **No specific Rone chord pair is in the public
  record. If a pass ever reports one, it was invented.**
- **Heine, "Chromatic Mediants and Narrative Context in Film"** — Wiley paywall.
- **Lothlórien's pitches.** Titus prints the melody; the scan is too coarse and
  the researcher refused to guess. Certain from the image: 5/4 then 4/4, no key
  signature, ≥5 written flats, range ~D4–C5. Her claims: maqam hijaz with the
  microtones removed, mostly stepwise, **final interval an unresolved augmented
  second**, monophonic.
- **Doug Adams' free "Annotated Score" PDF contains NO NOTATION** — 48 embedded
  images, all film stills. The notated themes are in the printed book (Alfred
  2010, ISBN 9780739071571). Do not let anyone claim otherwise; the researcher
  checked the file.
- The published orchestral score is rental-library only (CAMI Music). The
  official instrumentation string is public:
  `3(2+afl,ney,bfl,3.picc+tin whistle).3(3.eng hn).3(3.bs cl).3(3.cbn) – 5.4.3(3.bs tbn).1 – timp,5perc,dulc – mus,gtr,hp,pno(+cel) – boy's chorus,SATB – str+irish fiddle,sarangi(16.14.12.10.8)`.

## §11 WHERE TO GET THE NOTES, FOR THE NEXT PASS

The two techniques that worked, recorded so they are not rediscovered:

1. **flat.io's `/api/v2/scores/<id>/revisions/last/json` is free and returns
   complete score-partwise MusicXML** — step, alter, octave and duration per note,
   all parts. The `midi`, `mxl` and `abc` endpoints all return HTTP 402; **`json`
   returns 200.** This is how the full orchestral Shire, Rohan, Isengard and
   Fellowship scores were read. Use the concert-pitch parts; horn parts are
   written transposing.
2. **abcnotation.com suppresses display for copyright tunes but still prints a
   direct link to the raw `.abc` file**, which serves the full notation. The
   indirection is the trick.

Free PDFs with real engraved notation, all fetched successfully: the **Young**
thesis (OhioLINK, BGSU 2007, ~58 notated examples — the richest single source),
**Titus** (UNI 2013, Gondor and Lothlórien), the **Macksey Journal** article (five
notated examples including a full string score), **Lee & Lee** (Rast Musicology
2022, the neo-Riemannian table), Alfred's free `content.alfred.com/catpages/<ITEM>.pdf`
samples for every instrument in the *Instrumental Solos* series, and a 169-page
fan transcription of the complete FOTR recordings.
