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

### Phase 1 — `form.feature` on every genre  *(program-wide)*

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

### Phase 2 — the 16-bar grid comes apart  *(dungeon synth + DS2 tables, then `extend` program-wide)*

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

### Phase 3 — a hook that returns identically  *(program-wide mechanism, per-genre taste)*

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

### Phase 4 — the second keyboard is a character  *(DS2 and dungeon synth)*

- It must be present. Seed 7 has none for 11 minutes; find whether that is
  `form.roles`, the `rest` coin (`keys2: 0.26`), or the entry fractions, and fix
  the one that is actually responsible.
- It carries the fixed figure through DS2's climax, where the fuzz is at 0.68
  and the double kick is running. This is the "keyboards as guitars" idea made
  concrete, and it is Summoning's documented method: the riff was written on the
  keyboard.

**Verify:** `keys2` bar count per record across 8 seeds — today 0 to 71 out of
~150. And read the climax bars in the printout to see the figure repeat.

### Phase 5 — the melodic peak  *(program-wide, the one new mechanism)*

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
