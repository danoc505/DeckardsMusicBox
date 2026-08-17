# THE RULE OF THREE — the loop, and the third time, `2026-08-17`

> *"What ever is deciding the notes is ALL wrong we need to start fresh. We need
> LOOPS that repeat three times and then evolve this is the basis of ALL MUSIC!
> We need a motif! ... You need research and to read more of the docs in the
> files, read the text docs in the main branch."* — the owner

I read them. **The repo had already written the answer down, twice, in full,
with sources — and neither doc was ever built.**

---

## 1. WHAT WAS ALREADY IN THE FILES

`docs/LOOP_TO_SONG.md`, a research pass over ten practitioner transcripts,
opens with this:

> **"A song is not made by generating different material for each section. It is
> made by taking ONE loop, spreading it across the whole timeline, and then
> SUBTRACTING."**
>
> "Every practitioner source says this independently. **The engine has been doing
> the opposite:** generating a second bass take, stamping hooks, transposing
> melodies per section — manufacturing new material where the craft calls for
> removal."

And §6, the rule of three, stated exactly as the owner states it:

> "Once = intriguing, but not yet memorable · Twice = reinforced; the person
> playing it can now sing it back · **Three times = the brain begins to tune it
> out.**
>
> So on the third pass you must do one of two things: **go somewhere different**,
> or **start the same, then diverge** partway through — *'oh yeah I've heard this
> before — but you haven't, because we're going to go somewhere different'*."

`docs/STORY_AND_MATERIAL.md` §1 names the missing character:

> "**The characters are MOTIVES**, and they are literally called agents... The
> protagonist of a song is its motif." · "**B should be derived from A by
> opposition**, not generated independently."

## 2. AND THE PROGRAM DID NONE OF IT — measured before the change

```
1. ONE loop, spread and subtracted?
   6.5 SEPARATELY-COMPOSED materials a record.
   notes each shares with A:  Avar 29%  B 40%  Bvar 20%  C 11%  Alift 17%  Avarlift 7%
   seed 2: B 0%, Bvar 0%, C 0% — literally nothing in common with A.

2. The rule of three?
   79 section functions stated 3+ times; the 3rd plays the SAME material as the
   1st and 2nd in 24 of them (30%). Nothing evolves on the third pass, ever.

3. B derived from A by opposition?
   B follows A's contour on 54.7% of steps.   (50% = unrelated)
   B shares A's rhythm on 43.8% of its onsets.
```

**And the guard that should have caught it has the right name and measures the
wrong thing.** `probe_rule_of_three.js` reads AUTOMATION LANES on the third
statement — it prints `0.0 lanes · *** NONE` for every section function of this
genre and passes, because a knob that has not moved is not what that file calls
a fault. A guard on the notes had never existed.

---

## 3. WHAT WAS BUILT

### 3a. The loop is four bars — a two-bar motif and its restatement

`materialBars` was **8**, and its stated reason was *"a 4-bar cell came round
43.3 times in a 173-bar record, and no writing survives forty-three hearings."*

That reason is real and the fix was the wrong one. **A loop that comes round
forty-three times is not the fault; a loop that comes round forty-three times
UNCHANGED is.** Lengthening the cell traded one fault for a worse one, measured
at the time and never acted on — `boxcar-the-missing-hook.md` §1:

| genre | one statement of the tune |
|---|---|
| synthwave | 8.7 s |
| vgm | 9.8 s |
| lofi | 12.5 s |
| dungeonsynth | 15.1 s |
| **boxcarsynth** | **27.1 s** |

> *"A hook is a thing you can hold in your head — a bar or two, a few seconds.
> This tune takes half a minute to say once, and then says something else."*

At four bars one statement is **13.8 s mean**, inside the range every other
genre sits in. And `buildTheme`'s hooky road writes bars 0–1 and copies them
exactly to 2–3, so the loop **is** a two-bar motif and its restatement by
construction. Owner's choice, asked and answered before any code: *2-bar motif
in a 4-bar loop*.

### 3b. The third statement starts the same and then diverges

Built in stage 3, **selected in stage 5**, because a repetition is not a
property of the material — it is a thing that happens to it in time, and only
`makePerformance` knows how many times a loop has been heard.

The vocabulary is four classical motivic transformations
[`STORY_AND_MATERIAL.md` §3], each applied to the loop's second half only:

| device | what it does |
|---|---|
| **sequence** | "repeating a motive at different pitch levels" — every pitch moved the same number of scale steps |
| **invert** | "flip the intervals — every rise becomes a fall", reflected about the phrase's own first note |
| **tail** | only the last note moves — the antecedent/consequent pair |
| **retrograde** | same rhythm, pitches reversed. Rare on purpose: least audible *as a relation* |

All-or-nothing, and it falls back to the plain loop — so it cannot make a record
worse than it was.

### 3c. Two bugs, both found by measuring rather than reading

**The vocabulary was a bug wearing a preference's clothes.** First run: 220
divergences across 40 records, `sequence 200, retrograde 20`, **invert and tail
at ZERO**. The seat check asked `reserved.has(...)` of every note — and the
material has already reserved every one of its own seats, so any device that
leaves a note where it found it failed on that note. Tail moves only the last
one; inversion maps its own axis to itself. The check was not choosing between
four devices, it was silently deleting the two that hold still. Fixed:

```
sequence 105 · tail 93 · invert 39 · retrograde 7
```

**And the first hearing was the diverged one.** Counting `floor(bar / bars) % 3`
put the tune's entry at bar 8 → 8/4 = 2 → the third slot, so **the very first
time a listener heard the tune it was already the departure.** "Once, twice,
three times" is a sequence and it has to start at once. Each material now
carries its own running count across the record, and resumes it after a bridge —
a listener does not forget a tune because something else happened.

---

## 4. WHAT IT MEASURES

`harness/probe_motif.js`, 8 seeds:

```
✓ one statement of the loop is short enough to hold in a head
    13.8s mean, against 8.7-15.1s for the genres §1 compared and 27.1s before
✓ the record composes a third statement at all          48 across 8 records
✓ and it STARTS THE SAME as the first two hearings      48/48
✓ and then DIVERGES                                     48/48
    devices: sequence 24, tail 15, invert 8, retrograde 1
```

**Watched failing.** Remove the `third` declaration and it reports 3 faults and
exits 1. The first pass at the guard printed `✓ 0/0` for two of those three, so
both now carry `thirds > 0` — an empty population is not a pass, it is an
unasked question, and this file has three separate guards in its history that
were green because they were measuring nothing.

The record-scale number, printed and not asserted:

| | distinct 4-note figures | most-heard figure |
|---|---|---|
| this morning | 166 | 4.0% |
| after the head became one realisation | 96 | 5.5% |
| **after the loop and the third statement** | **94** | **6.3%** |
| dungeon synth, for reference [§4] | 39 | 12.2% |

---

## 5. WHAT IS STILL WRONG — and it is the bigger half

**B, C and the lift are still separate tunes.** 94 distinct figures against
dungeon synth's 39 is still two and a half times too much material, and the
reason is unchanged from the measurement in §2: the record composes six or seven
melodies and only C is derived from A. `STORY_AND_MATERIAL.md` §3 is explicit
about what to do and calls it *"the single most valuable unimplemented idea for
this engine, because it produces genuine sectional contrast FROM ONE SOURCE,
which is the thing we keep failing to do — either generating unrelated material
or repeating"*:

- **B = A inverted, in the complementary register** — the antagonist, derived by
  opposition rather than drawn
- **the lift = the motif modulated**, not re-composed in the new key
- **Avar = A fragmented**, not A's head plus a new tail

That is task **#164** and it is the next thing to build. Until it is done the
record still has more than one protagonist, which is the fault under the fault.

Also still open and separately measured: the tune is quarter notes on the beat
with 216 distinct bar rhythms and no rhythmic motif (#156); the dynamics span
under 4 dB (#157); the space is undeclared (#158). `modal-jazz.md` §3b is the
sourced argument that those three are what carry a record whose harmony stands
still — *"when harmony remains static, RHYTHM becomes your primary tool"* — and
none of them is built.

## SOURCES

- `docs/LOOP_TO_SONG.md` §1, §6 — ten practitioner transcripts plus web research
- `docs/STORY_AND_MATERIAL.md` §1, §3 — Almén's musical narrative; the motivic
  transformation table; thematic transformation
- `boxcar-the-missing-hook.md` §1, §4 — the 27.1-second statement and the
  distinct-figure reference numbers
- [Elizabeth Margulis, *On Repeat: How Music Plays the Mind*, OUP](https://global.oup.com/academic/product/on-repeat-9780199990825)
  — repetition's three roles are **learning, segmentation and expectation**, and
  repeated listening produces "an attentional shift from more local to more
  global levels of musical organization". Fetched `2026-08-17` as the
  psychological grounding for why the rule of three is a rule at all.

---

# PART TWO — ONE TUNE, AND EVERY SECTION IS IT, `2026-08-17aa`

> *"Ok delete the bad code and tables and rewrite them correct! Do you need to do
> research on the web so you understand exactly what your doing?"*

Yes, on one point, and it changed the design: **which elements a transformation
must PRESERVE for the theme to still be recognised.** I had the list of devices
already (`STORY_AND_MATERIAL.md` §3). What I did not have was what survives.

## 6. THE RESEARCH — what is kept, what is changed

> "Thematic transformation is a musical technique in which a theme is developed
> by **permutation (transposition or modulation, inversion, and retrograde),
> augmentation, diminution, and fragmentation**." · "while thematic
> transformation is similar to variation, the effect is usually different since
> **the transformed theme has a life of its own and is no longer a sibling to
> the original**." — [corpus:wikipedia/Thematic transformation]

> themes "greatly differ in their expression (character), but **stay uniform in
> their basic melodic layout**" — [corpus:classicalmusic-notes, Liszt Sonata]

and from the songwriting side, the governing principle in one sentence:

> "sections feel satisfying when they are **differentiated enough to register as
> distinct but related enough to feel part of a coherent whole**"
> — [corpus:songacademy]

Plus the concrete contrast levers: *"choruses are generally higher than verses;
bridges are often the highest or most rhythmically distinct section"* and
*"modulating by a minor third is a great way to brighten up a bridge"*
[corpus:masterclass].

**Our sections have been differentiated and not related.** That is the whole
fault in one line, and it tells you what to keep: the **rhythm**, exactly, and
the **shape in scale steps**. Change the pitch level and the direction.

## 7. THE BAD CODE, AND IT WAS TRYING

`themeB` was already drawn as `buildTheme(..., { moveBias: themeA.dna.map(mv => -mv) })`
— A's shape, inverted. **The intent was exactly right and the mechanism reached
four notes:** `dna` is filled by `if(dna.length < 4) dna.push(move)` and
`moveBias` applies only `while(moveBias.length > dna.length)`. So the bias
governs the first four moves and then lets go. A derivation that abandons the
phrase after four notes is not a derivation, and the table read like one.

## 8. `deriveTheme` — and what it measures

Reads a source phrase as scale-step distances from its own first note **in the
source's key**, transforms those distances, and replants them from the target's
tonic **in the target's key** — so a modulation lands in the new key by
construction. Keeps `bar`, `step` and `dur` untouched.

| material | transform | was | now |
|---|---|---|---|
| **B** (the town) | `invert` | drawn, biased for 4 notes | A upside down, in the chorus's higher band |
| **Avar** | `sequence` by 2 | A's head + a fresh tune | A answered by itself a third away |
| **Alift / Avarlift** | `transpose` | re-composed in the new key | A's shape on the new tonic |
| **C** (the bridge) | `augment` | built `2026-08-17x` | A's rhythm doubled, A's intervals |

**B against A, 12 records, measured on direction:**

```
   same direction      35.8%    (was 54.7% — chance)
   OPPOSITE direction  64.2%    <- the inversion
   shares A's rhythm   94.4%    (was 43.8%)
```

**And how much of A's rhythm each material keeps** — the recognition carrier:

```
   Avar 100%  ·  B 94%  ·  Bvar 55%  ·  Alift 58%  ·  Avarlift 53%  ·  C 27%
```

`deriveTheme` succeeds 131 times in 136 across 40 records; the 5 that cannot be
seated fall back to the drawn tune, so a record that cannot hold the derivation
is the record it was rather than a record with a hole.

### 8a. A bug the seam check caught, and a fix that measured worse

**The seat is a seat at a PLACE.** The first cut derived Avar's answer at bars
0–1 and shifted it to 2–3 afterwards, so every seat was checked at a bar the
notes do not end up in. The seam check threw on 13 records in 40 —
`collision in Avar at 3:12:70`. `deriveTheme` now takes a placement offset and
checks where the notes actually go.

**And the counterpoint cost is real.** `probe_theory`'s unresolved non-chord
tones went **20.3% → 29.2%** when three materials started being derived: a
transform bypasses the arrival and departure laws `buildTheme` enforces at its
own pitch choice. The obvious repair — snap a long or strong-beat note to the
nearest chord tone, which is the sourced melody target — was **built and
measured worse, 29.2% → 31.9%**, because moving one note to a consonance turns
its two neighbours into leaps and *leaps away from dissonance* is exactly what
that probe counts. Reverted, and the attempt is kept in the comment.

That is the **second time today** a plausible repair measured worse than the
thing it repaired (the other is `modal-jazz.md` §1's interval budget), and the
pattern is identical: a rule that is right about one note in isolation, applied
to a line where every note is somebody else's neighbour. **Task #166** — the fix
is to run the derived line through the same per-note narrowing the drawn one
gets, not to patch pitches after the transform.

## 9. AND THE HEADLINE NUMBER BARELY MOVED — which is the right answer

```
   distinct 4-note figures    166 -> 96 -> 94 -> 93
   most-heard figure         4.0% -> 5.5% -> 6.3% -> 6.7%
```

**Inversion does not reduce distinct pitch figures and should not.** B upside
down produces new pitch sequences by design; what makes it *related* is the
rhythm and the shape, which the count cannot see. The dungeon-synth 39/12.2%
reference was measured on a genre whose materials are literally similar; ours
are now related-by-transform, which is the better relation and the wrong thing
to measure with that ruler. **The number to watch is the rhythm-share table in
§8**, and it went from "unrelated" to 94–100% on the two materials that carry
half the record.
