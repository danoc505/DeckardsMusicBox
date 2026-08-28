# NEXT BUILD — the part you remember

*Written 2026-08-28 after the owner read four DS2 printouts. Nothing here is
built. Every number in §2 was measured off `harness/mk2_score.js` on build
`2026-08-27a`, seeds 1, 3, 7 and 42.*

> **The owner, and this is the whole job:**
>
> *"The songs are always too safe and formulaic. They never go to an extreme,
> there never is a pure solo or something out of the box interesting and
> different that defines a song. There never is a memorable part that defines a
> song and this is a program wide issue."*
>
> *"I think we are missing the hook, a second keyboard. I think we might have to
> think of the keyboards as the guitars."*

---

## 0. THE FINDING THAT SHAPES THIS WHOLE PLAN

**Five of the six things below already exist in the engine.** They are built,
they are sourced, they have their own comments arguing for them — and the
dungeon synth genres never declared them. One of them is declared by **nobody**
and its own worked example in the file is written in the voice of a genre that
was deleted.

| mechanism | what it does | declared today by |
|---|---|---|
| `form.extend` | cadential extension — a section runs 4–8 bars past its end | **fantasy synth only** |
| `form.transition` | a 1–7 bar section spliced before an arrival | **lofi only** |
| `form.feature` | `{solo: "lead"}` / `{duel: [...]}` / `null` rotation per movement | **nobody** |
| `theme.verseHook` | the A material restates its first four bars verbatim | **nobody** |
| `materialTakes` | N realisations of a part, so restatements differ on purpose | **fantasy synth only** |
| a melodic peak | *(does not exist — the one genuinely new thing)* | — |

**So this is mostly a table build, not an engine build**, which is exactly what
this project's first principle asks for: *constraints declared in tables, never
values wired into stage logic*. It is also why it is cheap and why it can be
judged by ear quickly.

**Decision taken by the owner, 2026-08-28:** switch these on **everywhere**, not
just on the dungeon synth genres. And **leave record length alone** — 10–13
minute records stay; the fix is shape, not duration.

---

## 1. WHAT IS PROGRAM-WIDE AND WHAT IS DUNGEON SYNTH'S

The owner asked for this split explicitly, so it is the organising axis of the
plan rather than a footnote.

### PROGRAM-WIDE — the engine, or a table every genre gets

| # | change | why it cannot be genre-local |
|---|---|---|
| **A** | **The melodic peak.** A theme's highest note is struck **once** in the phrase, and its lowest once. | It is a property of what a tune *is*, not of a style. It belongs in `buildTheme` beside the existing contour rules, and every genre's lead benefits. This is the only NEW engine code in the plan. |
| **B** | **Turn on `form.feature` for all five genres.** Each genre declares its own rotation, but no genre should have zero. | The defect the owner named — *"no solos, no duels, just a mash of colliding noise"* — measured identically in every genre: 3–5 pitched parts playing continuously, line-up churning every ~2 bars, nobody ever in front. |
| **C** | **Turn on `form.extend` for the four genres that lack it.** | *Every section function has exactly one length, in every genre in the file* — the engine's own comment, measured over ~2,000 sections. Universal defect, universal fix. |
| **D** | **Turn on `theme.verseHook` where the verse carries the record.** | The engine comment says it plainly: *"themeB has passed `hooky: true` since it was written; themeA has never passed anything"* — so the only hook any genre has ever had lives in the material you hear least. |

### DUNGEON SYNTH AND DS2 ONLY — genre tables

| # | change | why it is genre-local |
|---|---|---|
| **E** | **Break the 16-bar grid.** `lengths` currently reads `{intro:4, verse:16, chorus:16, bridge:16, instrumental:16, outro:16}` — every section the same size. Give the functions differing base lengths, then let **C** vary them per record. | A genre's section lengths are the definition of its pacing. lofi's 8-bar verse is lofi being lofi. |
| **F** | **Declare `form.transition`.** Dungeon synth declares none, so it can never produce the 1, 2, 3, 5 or 7-bar section the engine was built to allow. | Same reason — it is a pacing habit, and lofi's existing one is tuned for lofi. |
| **G** | **The second keyboard becomes a character.** Today it is absent from whole records (seed 7: zero `keys2` bars in 11 minutes) and is the *least* faithful part on restatement (as low as 4 of 16 bars). Give it a declared job and a guaranteed presence. | This is the owner's "keyboards as the guitars" idea, and it is DS2's identity rather than a general law. |
| **H** | **DS2's climax gets the fixed riff.** Where the fuzz is at 0.68 and the double kick is running, the second keyboard plays the record's hook figure rather than a fresh variation. | Summoning's method — the riff written on the keyboard — is this genre's thesis, not the program's. |

---

## 2. THE MEASUREMENTS THIS IS ANSWERING

All from the four printouts, so the "after" has something to be compared to.

```
  EVERY SECTION IS 16 BARS      41 of 41 sections across four records
                                (intro 4, then 16 × every time)

  THE LINE-UP CHURNS            someone enters or leaves every 1.8-2.5 bars
                                89 / 60 / 102 changes in a record

  NOBODY IS EVER IN FRONT       0 bars of total silence in any record
                                lead alone mid-record: 0 bars (seeds 1, 7)
                                the only thin bars are the first and last 16

  THE DECK IS SMALL             7-38 distinct bars per lane per record
                                so material DOES repeat — that was never it

  RESTATEMENT IS NEARLY-BUT-NOT-QUITE
                                material A returns: lead 13-14 of 16 bars match
                                                    ostinato 16 of 16
                                                    keys as low as 4 of 16
```

**The last block is the diagnosis.** The sources draw the line exactly here:
*"A hook is usually repeated **the same way each time**, while a motif serves as
material that is **modified and developed**."* The program only writes motifs.
A restatement that is 80% the same is too similar to be new and not identical
enough to register as *that thing again*.

---

## 3. THE BUILD, IN ORDER

Each phase is its own commit with its own before-and-after off the printout.
**Do not stack two of these into one commit** — if the record gets worse, the
whole value of this plan is knowing which one did it.

### Phase 1 — `form.feature` on every genre  *(program-wide)* — **DONE, build `2026-08-28a`**

Declared on all five genres. Measured, seeds 1 and 7, off the printout:

```
  record            featured bars           bars with exactly
                    (1-2 parts, mid-record)  ONE pitched part
  lofi-1                  4 ->   4              0 ->   0     (see below)
  lofi-7                  8 ->  14              0 ->   8
  synthwave-1             0 ->  20              0 ->  36
  synthwave-7             1 ->  29              0 ->  36
  dungeonsynth-1         27 ->  51             24 ->  57
  dungeonsynth-7         31 ->  50             22 ->  52
  fantasysynth-1        203 -> 248            118 -> 188
  fantasysynth-7        250 -> 262            112 -> 163
  ds2-1                  27 ->  68             24 ->  77
  ds2-7                  31 ->  72             22 ->  74
```

**synthwave is the headline**: a genre that had *zero* bars under three pitched
parts in a whole record now has 20 and 29. The line-up also churns *less* — one
change every 4.0 bars against 5.9 — which is the point: fewer changes, each
meaning something.

**No new holes.** The longest run of bars with no pitched part is unchanged from
the baseline on every record. Sections that announce a part which never sounds
went 8→6, 10→9, 8→6 and were unchanged elsewhere — a **pre-existing** defect
that this build slightly improved rather than caused.

**One regression was caused and fixed inside the phase.** The first draft
featured `keys2` and `counter`. It put a **16-bar hole** in fantasy synth seed 7
(bridge at bar 180: the feature dropped the bass to put the second keyboard in
front, and the second keyboard had no notes). Cause: `tryPad` returns an empty
array when the pad finds no register, but the role stays in `active`, so a
feature can hand a section to a part with nothing to play. Rule adopted: **only
lead / bass / keys / ostinato may be front-line**, since only those are built
unconditionally. The single exception is ds2's `deeper`, where a lead+keys2
*duel* is safe because the lead is always built.

**And it produced Phase 4's number.** The second keyboard is absent from **7 of
20** ds2 records (seeds 2, 7, 12, 13, 14, 19, 20). The file had asked for that
rate to be "reported rather than assumed" and nobody had ever reported it.

**⚠ AND THE TABLE ABOVE UNDERSTATES IT, BECAUSE THE MEASUREMENT WAS WRONG FOR
SHORT RECORDS.** It counts featured bars outside a fixed 16-bar margin at each
end — sized for a 156-bar dungeon synth record. On a **49-bar lofi** record that
throws away 32 of 49 bars, including the whole final chorus. lofi seed 1 was
reported as "did not move", and reading the section table shows it plainly did:
its peak chorus went from `drums bass keys keys2 lead` to `drums lead keys2`.

Re-measured with a **proportional** window (skip the first and last 10%):

```
  lofi-1           8 ->  16          dungeonsynth-1   28 ->  52
  lofi-7          12 ->  20          dungeonsynth-7   34 ->  53
  synthwave-1      0 ->  26          fantasysynth-1  163 -> 209
  synthwave-7      1 ->  29          fantasysynth-7  210 -> 224
  ds2-1           28 ->  69          ds2-7            34 ->  75
```

**Every record improved, lofi seed 1 doubled, and nothing was open.** Third time
this session that "suspect the measurement first" was the right call — the other
two were groove offsets counted as note content, and a `sed` line range that
reported the second keyboard missing from 20 of 20 records when it was present in
13.

---

### Phase 1 — as originally planned

The mechanism is at `Deckards Orchestrator MK2.html` ~line 42125, runs after
`rest` and before `thinTo`, and keeps drums and drone as the ground. It reads
per-movement first, then per-function, like every other table of its kind.

Declare a rotation per genre. Dungeon synth and DS2 keyed on their movements
(`descend`, `halls`, `deeper`, `return`); lofi and synthwave on function.
`null` entries are mandatory in every rotation — *"a record where every section
is a solo is as flat as one where none is"*.

**DS2 specifically:** the climax leg gets `{duel: ["keys2", "lead"]}` — the
second keyboard trading with the tune under the fuzz — and `return` gets
`{solo: "lead"}` so the record ends on one voice.

**Verify:** re-run the parts-per-bar count. Today it is 3–5 for the mass of
every record with no mid-record thin bars. Expect whole sections at 1–2 pitched
parts plus the ground, and say how many.

### Phase 2 — the 16-bar grid comes apart — **DONE, build `2026-08-28b`**

Research: `docs/genre-research/breaking-the-grid.md`. **The base `form.lengths`
were NOT changed**, and that is the sheet's main finding: the genre's founding
record (Mortiis, *Født til å herske* — one 53-minute song, "numbing repetition",
"subtle variations rather than dramatic structural changes") argues *for* the
uniform block. Both devices used instead **add and never cut**, so the block is
kept and only its edge is broken — and no record length is spent, which the
owner ruled out separately.

**Section lengths, 20 records a genre:**

```
  dungeonsynth / ds2   {4, 16}  ->  {1×6, 2×12, 3×5, 4×20, 16×176, 18×10, 20×13}
  lofi          {2,3,4,8}  ->  {1×5, 2×15, 3×8, 4×34, 8×93, 10×5, 12×10}
  synthwave         {4, 8}  ->  {4×95, 8×208, 10×14, 12×17}
  fantasysynth                  unchanged — BYTE-IDENTICAL, it already had the device
```

**The extension rate lands on its source.** Kallstrom's repertoire survey gives
roughly one section in seven; measured here: **dungeon synth 11.6%, synthwave
13.0%, lofi 13.9%** of eligible sections.

**The transition is the bigger device for the dungeon synths**, because it is
the only door to a section shorter than four bars — it fires in 15 of 20 records
at 1 to 3 bars, which at 54 BPM is 4 to 13 seconds.

**Record length drift**: +4% to +8% (dungeon synth seed 7, 11:05 → 11:50).
synthwave seed 7 got *shorter* (5:06 → 4:56) — the form builder hits its target
with fewer sections once sections can extend.

**No throws in 100 records** across five genres, except **lofi seed 17**, which
is the pre-existing failure already filed in `BACKLOG` §0ac and reproduces
identically.

**And it corrected a Phase 1 overclaim.** An adversarial review agent found, and
direct measurement confirmed, that dungeon synth's `descend` leg gets **one
section in 9 records of 20** — so its rotation is rescued and inert there, and
"the descent opens on one keyboard" is a promise about half the records rather
than all. The mechanism is behaving correctly; the comment was wrong and is
fixed.

---

### Phase 2 — as originally planned

Two edits that must land together or the second has nothing to vary:

1. **Genre-local:** give dungeon synth's `form.lengths` differing values per
   function rather than 16 across the board. This is where the research belongs
   — the community guide's ABAB / ABAC / ABCBC shapes are about sections of
   *different character and size*, and Icewind Dale's AA'A'' is a short unit
   said three times, not a 16-bar unit said once.
2. **Program-wide:** `form.extend` on the four genres that lack it, sized like
   fantasy synth's (`chance: 0.22, bars: [4, 8]`) but tuned per genre. The
   sourced proportion is roughly **one section in eight** and the extension
   **adds to the end, never cuts** — the extra bars wrap to the material's
   opening, so the hook gets said once more as a tag.

**Verify:** the section-length histogram. Today `{4: 1, 16: 10}` in every
record. Expect several distinct lengths and at least one extension per record.

### Phase 3 — a hook that returns identically — **DONE, build `2026-08-28c`**

Research: `docs/genre-research/the-hook.md`.

**THE INVESTIGATION THE PLAN DEMANDED CAME BACK NEGATIVE, AND THAT MATTERS.**
The plan said to find out *why* a returning material matches 13 of 16 bars
rather than 16 of 16, and named three suspects. Measured directly from the
composed song: **two occurrences of the same material carry byte-identical notes,
100% of the time**, across every material, every role, twelve seeds. There was no
defect. The 13/16 was my own printout comparison lining up sections of different
length and different personnel — in one case a 4-bar intro against a 16-bar
verse. **Restatement in this program was already exact.**

**The real gap was one level down.** The tune itself never repeated anything:

```
              repeated cell in the tune      after
              A (verse)   B (chorus)         A
  lofi          0/12        1/12             0/12  (deliberately left out)
  synthwave     0/12        0/12            12/12
  dungeonsynth  0/12       10/12            12/12
  fantasysynth  0/12        0/12            10/12
  ds2           0/12       10/12            12/12
```

**Zero of twelve, in every genre.** Four bars of continuous invention in the
material that is most of every record. `theme.verseHook` was declared on four
genres; the tune now states a two-bar cell and repeats it exactly.

**The tune also got denser** — lead notes per bar 0.68 → 0.99 in the dungeon
synths, 1.48 → 1.95 in synthwave — because each genre's `theme.count.hooky`
allows more notes than its `normal`. Not the aim, and worth stating.

**And the right-hand column explains itself**: `hooky: !STORY.B`, so any genre
declaring `theme.story.B` gets a *derived* chorus instead of a hooky one. Three
of the five do. Synthwave — whose plan legs are literally named `rise`, `hook`,
`strip`, `rise2`, `climax` — had **no hook in its verse or its chorus**.

**Phases 1 and 2 held**: featured bars unchanged or better, section lengths
identical. 124 of 125 records compose; the one failure is lofi seed 17, the
pre-existing `BACKLOG` §0ac fault, in the one genre this phase did not touch.

**Named and not built** (`the-hook.md` §5): the sources say the strongest hooks
repeat *with a small variation* — "the cell returns, but something small changes"
— and ours is a byte-exact copy. That is the next move, and it is the one that
speaks directly to "we are evolving past Mortiis".

---

### Phase 3 — as originally planned

`theme.verseHook` makes `themeA` restate its first four bars instead of writing
a fresh phrase over bars 5–8. Declare it on dungeon synth and DS2 first, then
each other genre where the verse carries the record.

**And investigate before declaring anything else:** work out *why* a returning
material matches 13 of 16 bars rather than 16 of 16. The candidates are the
occurrence-based vary demand (*state, repeat, change on the third*), the
`theme.story` operations, and `materialTakes`. Dungeon synth does not declare
`materialTakes`, so it is one of the other two. **Measure which, and report it,
before changing it** — this is precisely the kind of thing this repo's history
says gets "fixed" wrongly by guessing.

**Verify:** the bar-for-bar match rate between two statements of the same
material, per lane. Today: lead 13/16, ostinato 16/16, keys 4–11/16. A hook
should read 16/16 on its own bars.

### Phase 4 — the second keyboard is a character — **DONE, build `2026-08-28d`**

Research: `docs/genre-research/the-second-keyboard-was-never-there.md`.

**MY OWN PHASE 1 DIAGNOSIS WAS WRONG AND IT WAS IN WRITING TWICE.** I reported —
in a commit message and in a code comment — that the second keyboard goes
missing because `tryPad` degrades when no register fits. **The register never
came into it.**

The real chain: `canFill` computed `const kind = SLOT_ACCEPTS[slot] || slot` and
tested `M.slot === kind`, so `SLOT_ACCEPTS = {keys2: "keys"}` **replaced** the
slot's identity instead of extending it — and **the second-keyboard rack refused
every machine declaring `slot: "keys2"`.** A refused draw falls silently through
to `"auto"` in `resolvePicks`, and for this slot `"auto"` means *no pad is built
at all*. The pool's dead weight (8 of 23 = 34.8%) and the observed absence
(7 of 20) were the same number, and I had both in front of me.

**An audit of every pool in the file then found 32 of 287 weight — 11.1% —
naming a box that cannot be racked**, including three sampled instruments that
could fill *no* rack at all. Two faults were the engine's (fixed with one line)
and two were the tables' (`erPluck` is `slot: "ostinato"`; `erLeadLow` sounds at
32.7 Hz and is `slot: "bass"` — both declarations verified against the bank
index and both correct, so the pools were wrong).

```
  records with a second keyboard      dead pool weight
    ds2           13/20 -> 20/20        32/287 -> 0/273
    dungeonsynth  13/20 -> 20/20
    fantasysynth  13/20 -> 20/20
```

**Surgical, which is the evidence it was a fault and not a taste:** lofi and
synthwave are **byte-identical** (no Erang boxes in their pools); fantasy synth
seed 1 moved 4 lines of 3085; the records that were already fine moved ~1%; and
**seed 7 — zero bars of second keyboard in every measurement this session — now
has 52 to 67.**

**ITEM H IS BLOCKED BY ARCHITECTURE, not declined.** The plan wanted the pad to
carry a rhythmic figure through the climax. The mechanism exists (`pad.press`)
and the sources license it *only* for "upbeat productions" — which the climax
is — but `const PAD = (opts.sustain && G.pad) || {}` is read at **material build
time**, and a material plays in several legs, so it cannot be scoped to one.
What the part does instead is the sourced rhythm-guitar role anyway: a held wall
through the Big Muff, trading with the tune under the double kick.

---

### Phase 4 — as originally planned

- It must be present. Seed 7 has none for 11 minutes; find whether that is
  `form.roles`, the `rest` coin (`keys2: 0.26`), or the entry fractions, and fix
  the one that is actually responsible.
- It carries the fixed figure through DS2's climax, where the fuzz is at 0.68
  and the double kick is running. This is the "keyboards as guitars" idea made
  concrete, and it is Summoning's documented method: the riff was written on the
  keyboard.

**Verify:** `keys2` bar count per record across 8 seeds — today 0 to 71 out of
~150. And read the climax bars in the printout to see the figure repeat.

### Phase 5 — the melodic peak — **DONE, build `2026-08-28e`**

Research: `docs/genre-research/the-melodic-peak.md`. The only new engine code in
this plan, and it is a narrowing on the next choice, never a repair.

**Measured per two-bar phrase, which is the unit `phrase()` writes:**

```
                     top struck once         bottom struck once
  genre         before  after    Δ       before  after    Δ
  lofi            78%    84%   +6          78%    84%   +6
  synthwave       67%    65%   -2          66%    65%   -1
  dungeonsynth    67%    83%  +16          65%    72%   +7
  fantasysynth    51%    53%   +2          43%    51%   +8
  ds2             67%    83%  +16          65%    72%   +7
```

**And the tunes got wider** — span 4.8 → 5.2 in the dungeon synths, 4.9 → 5.6 in
fantasy synth, 6.4 → 7.3 in lofi — because the candidate is offered a step
*further out* before a step back in, so the climax moves rather than folding
back. That was not the aim and it is the closest thing in this build to "going
to an extreme". Note loss under 4% everywhere, zero on fantasy synth.

**Two measurement corrections inside the phase**, both caught by suspecting the
measurement: measuring per *material* reported "22% → 22%, does nothing" — wrong,
because a hooky material copies its phrase and duplicates the top by
construction; and the first implementation offered one way off the extreme and
succeeded only ~43% of the time, which instrumentation showed was the failures
themselves, not downstream interference.

**Not fixed, and named**: the apex still sits at a quarter of the phrase against
the sources' two thirds; and the residue is tunes too thin to shape — ds2 seed 1's
tune is three notes spanning two semitones, and no contour rule reaches that.

---

### Phase 5 — as originally planned

In `buildTheme`, alongside the existing contour constraints: the phrase's
highest note is struck **once**, and its lowest once. Sourced from the community
composition guide — *"pick a low note and a high note no more than about 12
notes apart… the high note should only be hit one time. Same for the low note."*

A constraint on the next choice, never a repair afterwards — the file's own law.
Do this **last**, because it is the only phase that touches shared note-writing
code and it should land against a record whose shape is already fixed.

**Verify:** count how many times each theme hits its own top note. Today
unmeasured; measure it before the change so there is a before.

---

## 4. WHAT THIS PLAN DELIBERATELY DOES NOT DO

- **Tremolo picking.** The owner: *"I'm not saying no, I'm saying you have
  failed to be able to do anything but keys and drums."* Correct, and it is
  downstream of everything above. A fast re-struck riff needs a section the
  right length and a moment where it can be heard alone. Revisit after Phase 4.
- **Shortening the records.** Ruled on: length stays.
- **New instruments.** Nothing here needs one.

---

## 5. THE COST, STATED UP FRONT

**Every genre's records will change.** The owner chose to switch the
program-wide items on everywhere rather than fence them to dungeon synth, so
lofi, synthwave and fantasy synth all move. That is the accepted trade and it
has a consequence for how this is reported: **each commit must say how many
records moved and which parts of them**, per the standing rule. "Byte-identical
for the untouched genres" is not available as a safety net on this build, so the
printout before/after is the only evidence there will be.

The compensating protection is one phase per commit. If the ear says a record
got worse, the bisect is five commits deep at most.

---

## 6. VERIFICATION, END TO END

There is one test and it is the printout:

```sh
node harness/mk2_score.js --genre ds2 --seed 1
node harness/mk2_score.js --genre ds2 --seed 7      # the one with no keys2
node harness/mk2_score.js --genre dungeonsynth --seed 1
node harness/mk2_score.js --genre lofi --seed 1     # a genre that also moved
```

Per phase, re-derive the five numbers in §2 and print both sides. The analysis
that produced them is reproducible from the printout alone — section lengths
from the section headers, line-up churn and parts-per-bar from the part lines,
restatement match by comparing two sections carrying the same material name with
the bracketed groove offsets stripped.

**Strip the groove offsets.** The first pass of that measurement counted them as
part of the notes and reported that the program never repeats a bar, which was
the opposite of the truth. Suspect the measurement first.

**And then ship it and let the owner listen.** Every device in this plan is one
the sources say makes music memorable. Not one of them has been heard yet.
