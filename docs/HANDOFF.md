# Handoff — Deckard's Orchestrator MK2

> ## ⚠ 2026-08-20 — READ THIS FIRST. THE BRANCH MOVED AND THREE ITEMS BELOW ARE NOW MEASURED.
>
> **The branch is `claude/orchestrator-mk2-handoff-e8475j`**, not
> `claude/code-review-6jd9cz`. Everything below the line was written on the old
> one and its head is stale.
>
> **THE PRINTOUT WAS NOT BEING READ, AND THAT IS THE LESSON OF THE SESSION.**
> `mk2_score.js` was run some sixty times and grepped for exceptions. Reading it
> shows the record's pitched parts are nearly static, and the summary line said
> so all along:
>
> | | seed 1 | seed 7 |
> |---|---|---|
> | bass | **2 pitches** (C#2, G#2), 502 notes | **1 pitch** (F1), 222 notes |
> | keys | **1 rhythm shape** for 194 bars | 1 shape for 146 bars |
> | counter | **2 pitches**, 42 of 411 bars | — |
>
> The bass prints `\|*---------------\|` in 243 of 250 bars — one strike on beat
> one, held sixteen steps. **Item 6 is worse than "sometimes two pitches": on
> some seeds it is one.**
>
> **ITEMS 4 → 3 → 6 ARE ONE CAUSAL CHAIN, now demonstrated rather than
> suspected.** `into the deep` declares material `C` and plays it in **2 of 6**
> sections; `the long way home` declares `Alift` and gets **3 of 6**. The rest
> are A-variants. So those legs stand in A's chord set, the record collapses to
> few chords, and the bass — which follows roots — has almost no roots to follow.
> Fix `vary` first and 3 and 6 move with it.
>
> **ITEM 7 CONFIRMED at 54.5%** of lead onsets on steps 0+8, seed 1, read off
> the printout rather than quoted from the old evaluation.
>
> **ITEM 8 REFINED:** the counter is not silent. It plays **D4 and E4 only**, in
> 42 of 411 bars. It is a two-note part, not an inaudible one.
>
> **AND THE THING TO DO BEFORE ANY OF IT:** `bassRoles` and `bassRiff` are built,
> researched and declared by **no genre** (`BACKLOG.md` §0aa). The backlog's own
> words: *"a part that pedals for nine minutes is pedalling by default rather
> than by decision"*, and *"it is about variety of JOB, not notes per bar."*
> Doom/sludge want the bass in unison with the riff, post-hardcore and prog want
> a counterline — four movements, four jobs. **That is a table entry, not a
> build.**
>
> New since this file was written: `docs/genre-research/the-four-acts.md`,
> `the-comp-does-not-land-on-one.md`, and `BACKLOG.md` §0ab (five new measured
> items, including a tempo-arc sawtooth the owner heard before it was found).


**Branch: `claude/code-review-6jd9cz`** (tracking `origin/claude/code-review-6jd9cz`).
Head is `f2292a7`. The artifact is
`https://claude.ai/code/artifact/b7004a11-15b7-4e76-be6e-dd39bb86ed06`; republish
the same file path to keep that URL.

> A local branch `claude/mkii-lofi-dungeon-boxcar-y8fc29` also exists and is what
> my session instructions nominate, but **no work of this session is on it**.
> Everything since the boxcar deletion is on `claude/code-review-6jd9cz`. If you
> want the other name, it needs a deliberate move — don't assume either is stale.

Build `2026-08-20j`. File **10.51 MiB** against a hard **16 MiB** artifact
ceiling; sample banks are roughly 80% of that, so any new bank is a budget
decision, not a detail.

---

## Where things stand

Shipped and measured this session:

- **The Erang pack swap.** 24 samples, every recording its own instrument, 12 s
  notes. Twelve pitched machines named by register (`erStringsHi/Mid/Low`,
  `erKeyLong/Mid/Hi`, `erLeadMid/Hi/Low`, `erPad`, `erPluck`, `erWind`).
- **The eight-drum kit.** Six Erang toms ordered lowest head to highest across
  the lanes that actually fire, plus `hat: tkStick` and `rim: tkKa` for the two
  high sounds.
- **The scene bank** (commit `7657bca`) — bullfrogs, two cricket/night beds, a
  great northern diver, a tawny owl, two rivers and a thunderclap, from the BBC
  archive, wired as atmosphere beds and a transition accent.
- **The war horn** (commit `f2292a7`) — `erWind` off the lead, onto the counter
  beside the carnyx, with `play.call`: 3–8 blasts a record, 7.6–14.3 s each,
  never under 22 s apart.
- **Two kinds of heavy** (commit `f2292a7`) — `kickPattern` per movement, the
  fight on a double pedal at 7.36 hits/s against 2.97–3.45 in the sludge legs,
  with the kick's tail and the fight's reverb both pulled back so the strokes
  land as strokes.

Full write-ups live in `docs/genre-research/`: `the-horn-and-the-two-feet.md`,
`planning-the-fx.md`, `the-leg-is-the-song.md`.

---

## The unfinished work

This is the standing list from the MIDI evaluation I ran across seed 1 and three
other seeds. **None of it is fixed.** It is ordered by how much it costs the
listener, not by how hard it is. Every number below is measured, and each item
names the mechanism at fault rather than the symptom, because in every case the
symptom is a consequence of one table doing exactly what it was told.

### 1. The keys land on beat one, every time

**Measured:** 100% of chord attacks are on beat 1 of their bar. Not "mostly" —
all of them, in every record checked.

**Why:** the comp writer places a chord at the start of each harmonic unit and
nothing displaces it. There is no syncopation vocabulary on the keys lane at all.

**Fix:** an onset pool for the comp, the same shape `snarePocket` and
`kickPattern` already are — a weighted list of entry points per material, drawn
on a named substream so nothing else moves. Anticipations (an eighth early) and
delayed entries are the two that matter; both are ordinary modal-jazz comping and
both are already sourced in `modal-jazz.md`.

### 2. The record does not breathe

**Measured:** 6–8 note attacks per second sustained across the whole twenty
minutes. For a record whose brief is atmospheric, that is a wall.

**Why:** every lane writes to its own density setting and nothing arbitrates
between them. The FX planner measures `gaps` off the arrangement but only spends
it on effects, never on whether a part should play at all.

**Fix:** the planner already computes the curve. Let it *subtract* — a per-section
attack budget that thins the lowest-priority lane when the total exceeds it. The
priority order is the genre's `roles` table, which already exists.

### 3. Seven to ten chords in the whole record

**Measured:** 7–10 distinct chords across twenty minutes.

**Why:** the harmony rows are short, and the vary mechanism re-uses one row
rather than drawing a second.

**Fix:** widen the rows per mode, and let a movement draw its own row rather than
inheriting the record's. This is the same repair as item 4 and they should be
done together.

### 4. ~~The legs mostly do not play their declared modes~~ — FIXED `2026-08-20v`

> The variant family came from the material name's first character, so `"C"` fell
> through to `"A"`. Fixed. `into the deep` plays material C in 6 of 6 sections
> (was 2), and its pitch classes went `G# A# F# D# E C# A B` → `G# F# E C# A` —
> the A# was dorian's major sixth, imported from another leg's mode.
> **But fixing it did NOT unlock items 3 and 6 as this file predicted:** the
> hijacking was adding foreign colour, not harmony. Distinct chords unchanged.

**Measured:** each leg declares a mode; most legs play the record's opening mode
instead. The mode's characteristic note — the ♭2 in Phrygian, the ♯4 in Lydian,
the whole reason to name a mode — comes out at **0.0%** in a majority of legs.

**Why, and this is the important one:** the `vary` mechanism replaces a
movement's material with A-variants. A leg declares its material and its mode,
then `vary` hands it the A material anyway, so the mode change is written in the
table and never reaches the notes. This is a **dead-config defect** in the class
this file has logged five or six times: the table says the thing, the music does
not do it.

**Fix:** `vary` must not cross a movement boundary. A movement's material is its
own; variants are drawn within it. Then force the characteristic note — the
melody writer should be required to sound it at least once per phrase, which is
what actually makes a mode audible.

### 5. The tune does not re-fit when the mode changes

**Measured:** in the walk-home leg, 8–15% of melody notes are a minor third over
a major chord.

**Why:** the motif is transposed into the new mode by interval, without checking
the notes against the new chord set.

**Fix:** re-fit on mode change — keep the contour, move the offending degrees to
the nearest chord tone. The machinery for "nearest chord tone" already exists in
the voicer.

### 6. ~~The bass sometimes has two pitches~~ — LARGELY FIXED `2026-08-20v`

> Worse than stated: it was ONE pitch on seed 7. `bassRoles` + `bassRiff` now give
> each act its own job. Seed 7: 1 pitch → 7, bars holding ≤1 pitch 100% → 28.3%.
> The doom leg still pedals **by declaration**, which is what doom asks for.
> Open: the fight gains rhythm and not pitch, because item 3 is still open.

**Measured:** whole sections where the bass plays exactly 2 distinct pitches.

**Why:** the bass follows roots, and with 7–10 chords in the record there are
very few roots to follow.

**Fix:** downstream of item 3 — more chords gives the bass more roots for free.
Beyond that, a passing-tone rule between roots, gated on the section's energy so
the quiet legs stay still.

### 7. The melody has one rhythm

**Measured:** 54–62% of melody onsets are on step 0 or step 8.

**Why:** `onsetPool` is narrow and the same pool serves every material.

**Fix:** per-material onset pools, and let the movement pick. Same shape as
item 1.

### 8. The counter and the monster are essentially silent

**Measured:** both lanes write, and neither is audible in the mix.

**Partly addressed:** the war horn now lands on the counter and it is audible —
that was today's work and it proves the lane reaches the speakers. The `auto`
counter and the monster still do not.

**Fix:** measure the counter's gain against the band the way the desk fix was
measured, and check whether the monster is being written at all or written and
buried. Do not assume it is a level problem before checking it is not an
arrangement problem.

---

## Open questions from today

Neither is a bug; both are calls you should make.

- **The fight is 1–1.6 dB quieter by RMS** than it was, with peaks unchanged.
  That is the reverb leaving, not the drums — dry reads harder, not weaker — but
  it changes the record's arc and you may hear the fight as backing off. If you
  do, the fix is drum *level* at the fight, not the room back.
- **The sludge legs keep the march.** You asked for a march three messages before
  you asked for sludge, so I read "sludge" as weight and space rather than
  half-time: the walk stays, the ticking stops. If you want them genuinely
  half-timed, the walk comes out of `SLUDGE_FEET` and that is a two-line change.

---

## Smaller loose ends

- `erTom2` and `erTom4` are reachable **only** through the SET switch, which
  rotates the whole kit. Stated in the source rather than left to be discovered,
  but it means two of the six recordings are near-unheard in normal play.
- `ghost`, `clap`, `rim`, `openhat`, `ride` and `crash` are written **zero times**
  in dungeon synth and fantasy synth. The lanes are mapped and the drums exist.
  Either give them figures or say in the table that they are set-only.
- `BARD_WIND_04.wav` is **D♯5, +24 cents** — the one file in the pack that is not
  a C. Everything else is C within 1–12 cents but spans **C1 to C5**, so the
  filing number is not the octave. `harness/erang2_bank.py` carries the
  measurement and the correction for `erStringsLow`, whose reader said C2 and
  whose odd harmonics prove C1.
- One Erang file is an exact md5 duplicate of another and is skipped by the
  encoder.

---

## Working the repo

```
node harness/mk2_score.js --genre G --seed N [--out F] [--mid DIR]
MK2_HTML="Deckards Orchestrator MK2.html" node harness/render_audio.js OUTDIR '1:genre:auto'
node harness/mk2_stamp.js write
```

The laws that bite most often:

- **Law 3** — draws execute unconditionally, on their own named substream. A draw
  inside a condition couples owners that are meant to be independent.
- **Law 4** — no code below stage 1 names a genre.
- **Law 7** — same seed, same samples. Never re-draw to fix something; decline
  instead, the way the doubling engine declines a signal instrument.
- **Law 10** — the offline render is bit-identical to live.

And the two habits that saved the most time this session:

1. **When a measurement surprises you, suspect the measurement first.** Three
   probes were wrong this session and two of them were expensive.
2. **A measurement that agrees with you is the more dangerous one.** The
   `kDecay` lane measured *identical to a tenth of a decibel* and that is the only
   reason we found it was wired to the wrong kit.
3. **A structural edit to a table this size needs a parser, not a regex.** A
   line-based transform broke the HTML twice, and guessing at the repair made it
   worse both times.
