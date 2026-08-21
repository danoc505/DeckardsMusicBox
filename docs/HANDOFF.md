# Handoff — Deckard's Orchestrator MK2

> ## ⚠ 2026-08-21 — READ THIS FIRST
>
> **The branch is `claude/orchestrator-mk2-handoff-e8475j`.** Head `f1eff4c`,
> build `2026-08-21j`. Everything in this file below "Where things stand" was
> written on `claude/code-review-6jd9cz` and parts of it are now stale — the
> items are annotated where they have moved.
>
> **A FIFTH GENRE EXISTS.** `GENRE.doomsludge` — a `merge(F, {...})` delta over
> fantasy synth, carrying the four-act record: doom → sludge → mathcore → prog.
> Most of this session's work is in that delta. The four parent genres are held
> byte-identical wherever a change could have touched them, and that is checked
> on every commit.
>
> **RUN `node harness/mk2_syntax.js` FIRST, ALWAYS.** It is one second and it
> catches the trap that cost two hours this session: the AudioWorklet sources
> (`RACK_DSP`, `ROOM_FDN`) are TEMPLATE LITERALS, so a bare backtick written in
> a comment inside one ends the string and the whole page fails to parse with a
> message naming an unrelated identifier. The render battery "catches" it by
> hanging for three minutes.
>
> **AND THE LESSON OF THE PREVIOUS SESSION STILL STANDS**, because it recurred:
> *read the printout*. Every real finding this session came from
> `mk2_score.js` output or from a rendered measurement with a control. Every
> wrong turn came from reasoning about the code instead. Two examples, both
> costly: the sludge bass plays **C#1 and E1** — you cannot know what the fuzz
> should do until you have read that; and the fight's keyboard fires **338
> events a section**, which no amount of looking at the table would tell you.

**Branch: `claude/orchestrator-mk2-handoff-e8475j`** (tracking `origin/`).
Head is `f1eff4c`. The artifact is
`https://claude.ai/code/artifact/b7004a11-15b7-4e76-be6e-dd39bb86ed06`; republish
the same file path to keep that URL, then `node harness/mk2_stamp.js write`.
**Publish first, stamp second** — the stamp asserts the page and the repo are
the same program.

Build `2026-08-21j`. File **10.74 MiB** against a hard **16 MiB** artifact
ceiling; sample banks are roughly 80% of that, so any new bank is a budget
decision, not a detail.

---

## Where things stand — 2026-08-21

### The pedalboard, sourced properly the second time

The first build of it was wrong and the owner heard it: *"all it does is
increase the pitch! No fuzz no degradation no deepening of the sound."* He was
describing the measurement. Full sourcing in
`docs/genre-research/the-pedals-are-the-genre.md`; what is built:

| pedal | circuit | note |
|---|---|---|
| **MUFF** | Big Muff Pi, Ram's Head values | tone stack **482 / 1206 Hz** (it was 560 / **2100** — the treble leg an octave too high), Miller caps inside each clipping stage, **MIDS** (the AMZ mod) and **MASS** (a clean low blend beside the dirt, not a shelf on it) |
| **MEATHEAD** | Fuzz Face — 5 of the 9 pedals on the owner's list are these | asymmetric via a DC offset, 2.2 µF input cap that keeps the bass, **BIAS** starves it into the velcro gate, **DARK** low-pass, and the 0.1 µF output coupling cap |
| **SUB** | 4013 flip-flop divider, in the rack worklet | one or two octaves down, constant-amplitude square, hard gate — but scaled by the input envelope, see below |
| **CHAINSAW** | Boss HM-2 dimed | gyrators at **86.79 / 958.47 / 1278.6 Hz**, +10 dB; three diode sets (soft asymmetric, hard, series-Ge dead zone) |
| **SAG** | power supply, in the rack worklet | fall constant **11 ms** from a measured Fender 5E3 (2.88 V/ms, 360→328 V); recovery is the knob, solid-state to tube |
| **COMP**, **OCTAVE**, **PHASER** | Dynacomp, Octavia, Phase 90 | the phaser stays on the owner's word and is not developed further |

Each has a panel with a POWER three-way (−1 genre / 0 off / 1 the knobs).
Only the pedals a record declares are ever constructed.

**Five faults were measured out of the first build.** They are worth reading in
the doc, because every one is the same shape — a constant calibrated against
something other than the program:

1. the tone stack's low leg deleted every harmonic the clipper made (92.9% of
   the fuzzed bass in 20–60 Hz, 26 dB louder than bypass and no more audible);
2. the Meathead had no output coupling cap, so its asymmetry became a DC term
   riding the envelope — 99.2% in 20–60 Hz;
3. the drive law was calibrated on a full-scale sine and the subgroup peaks at
   **0.055**, so 27× never reached the clipper's knee — it was a clean boost
   with a curve drawn on it;
4. the divider was a constant ±0.55 square against a part peaking at 0.055 —
   20 dB too loud — and an octave below C#1 is 17 Hz;
5. a speaker is a **bandpass**; `cab` had no low rolloff, so 65% of the doom
   act landed under 60 Hz.

### The pedalboard is on the matrix mixer

`PEDALS` is a column. It is an **insert**, and the column says so: the crossing
is the board's wet/dry depth on that row, `wet = depth` and `dry = 1 − depth`,
both driven from one ConstantSource so they cannot disagree. Its base is read
off the board's own `rows`, so there is no second table. Eleven blind plates
with reasons (every return row; the world).

It joined the automated set by itself — `axisMod` walks every column — so seed
1's doom record rides `bassPedals` 0.562–0.989 and `leadPedals` 0.665–1.000.

### Somebody is in front now

`form.feature` is a per-movement rotation of **solo / duel / tutti**, read with
the movement-then-function rule. A duel names two parts and they **trade, two
bars each**, in stage 5's bar loop. The ground — drums and drone — is never
removed by a feature.

Before: the fight ran **five pitched parts in nine of its ten sections**.
After: **1, 3, 5, 1, 3, 4, 2, 2, 1**.

### The rule of three, at the loop level

`FORM-RESEARCH.md` §2 lists four levels. The file enforced section (H1) and bar
(the fill) and had **nothing at the loop** — which is where the record actually
repeated:

```
                 lag1   lag2   lag4   lag8    distinct bar shapes
keys2 (fantasy)    0%    41%   100%   100%    5 of 89
keys2 (doom)       0%    20%    79%    71%    21 of 165
ostinato           0%     0%    49%    47%    35 of 274
```

From the third pass of a cell, its second half plays the variant — the sources'
own "most useful" rung. **Every third pass**, not every pass from the third,
because a change resets the count. Where no usable variant exists the part lays
out instead (not the drums, the drone or the bass).

### And 22% of every note was a duplicate

**1,462 of 6,543** — same part, same step, same pitch, twice; all of them the
keyboard, because the drawn doubling landed at unison and the keys lane comps
five chords a bar. The inherited table quotes Belkin — constant unison doubling
is *"the beginner's most common fault"* — directly above `uni: 0.70`. This
genre draws the octave now. **Collisions: 1,462 → 0.**

### Also this session

- **The carnyx is deleted.** Not the hurdy gurdy, which is alive. Historical
  comments were past-tensed rather than removed.
- **`harness/mk2_syntax.js`** — the one-second parse check described in the
  banner.
- **The four acts diverge.** doom vs fantasy synth on identical bars went from
  **100 of 100 bars identical** to 20%; the whole record 36% → 7%.

Full write-ups: `the-pedals-are-the-genre.md`, `the-four-acts.md`,
`the-comp-does-not-land-on-one.md`.

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

### 2. The record does not breathe — **MOVED `2026-08-21j`, not closed**

> `form.feature` (solo/duel/tutti) and the loop-level rule of three both take
> parts out. Doomsludge seed 1 went **6,543 events → 3,790**, and the fight from
> five pitched parts a section to one-to-five. That is the arrangement
> breathing. The **attack-budget arbiter this item asks for still does not
> exist** — nothing counts attacks per second or thins the lowest-priority lane
> when the total exceeds a budget. What was built is a shape, not a governor.

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

### 8. The counter and the monster are essentially silent — **still open, and now sharper**

> The counter measures **17 distinct bar shapes in 57 bars**, 49% identical to
> the bar four back. It is not silent and it is not inaudible; it is a very
> short loop that plays rarely. Read that before reaching for a fader.

**Measured:** both lanes write, and neither is audible in the mix.

**Partly addressed:** the war horn now lands on the counter and it is audible —
that was today's work and it proves the lane reaches the speakers. The `auto`
counter and the monster still do not.

**Fix:** measure the counter's gain against the band the way the desk fix was
measured, and check whether the monster is being written at all or written and
buried. Do not assume it is a level problem before checking it is not an
arrangement problem.

---

## What is owed, 2026-08-21 — read `BACKLOG.md` §0ag–§0ak with this

Four things, all measured, none guessed at.

### The bass is masked, not quiet (§0ak)

Deleting **every bass event** changed the record by **0.05 / 0.04 / 0.01 dB** in
the three heavy acts. Three levers were tried: `roleGain` 0.22 → 0.55 (+8.6 dB
on the part), register `[24,41]` → `[31,48]`, and a genuine bug fixed on the way
— the octave pedal's coupling cap was a **120 Hz** high-pass, which deletes the
69 Hz octave of a 34.6 Hz bass.

**It is still worth only 0.2 dB in its own 40–80 Hz band.** That band belongs to
the kick (`drumDrive: 1.75`, `roleGain.drums: 1.40`) and the drone
(`[21,31]`, 27–49 Hz). A part cannot be made audible by raising it inside a slot
two louder things already own. What is owed is a **frequency-slot decision**:
carve the kick, give the bass a presence band at 700 Hz–1.5 kHz so it is heard
through its growl, or move the drone off its octave. **The per-role EQ hook for
the second does not exist** — `g.grp[role]` has three biquads and no genre table
writes them.

### `longLoop` is dead for the part it was written for (§0aj)

`form.longLoop: { keys2: 2 }` does nothing, because `Avar`'s keys2 **is** `A`'s
keys2 and the swap is correctly guarded on the variant being a different array.
Fantasy synth's second keyboard plays **5 distinct bars in 89**, 100% identical
at lag 4, 8 and 16. The rule-of-three work routes around it; the real fix is
stage 3 composing a genuinely different `keys2` — **and nothing has audited
which other material/part pairs are identity.** That audit is the job.

### The fight renders under realtime, and it is not the pedals (§0ah)

```
                   pre-session     now
doom                 1.28x        1.14x
sludge               1.31x        1.18x
the fight            0.80x        0.61x
walk home            1.16x        1.01x
```

**The fight was already under realtime before any of this session's work.**
Removing every pedal unit accounts for about a fifth; the rest is the
arrangement. Candidates, none measured: the per-instrument channel strips
`ensureChannels` builds (fader, three biquads, an analyser each), the kit's own
sub-mixer, and `renderWav` holding every node for the whole excerpt.

**Caveat before anyone optimises on those numbers:** an offline render is not
live playback. 0.61x is the honest worst case, not proof the page stutters —
that has to be measured live and has not been.

### Named and not built

- **Sag as a rail rather than a stage.** A real starve moves the bias of every
  block it powers; here it is one stage at the end of the dirt chain. Stated in
  its own comment rather than implied.
- **A per-row fuzz voicing.** `space.fuzz` is per-act, so the bass and the
  keyboards share TONE, MIDS and CAB. The bass wants more grind and the
  keyboards want less; today they cannot disagree.
- **An Echorec-style delay**, from the Gilmour research. Named, not built.
- **The record is 20:44** against a 20:00 brief.

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
- **`PEDALS` crossings on a row with no board draw a knob with nothing to
  bypass.** A hand opening one arms a board on that bus — but only if a pedal is
  switched on, because the crossing is the cable and the pedal panels are the
  footswitches. Two statements, which is what they are on a real board.
- **`space.fuzz.rows` and `space.pedals.rows` name ROLES; the matrix's rows are
  BUSES.** `routeLevel` matches both (`MIX_ROLE_BUS` is the map). Naming
  `ostinato` opens the KEYS crossing. Written down because it is the kind of
  thing that reads as a bug the first time you meet it.
- **The octave-up pedal (`oct`) is a full-wave rectifier and belongs on the
  bass, not on the keyboards.** Putting it on a guitar-register part is what
  produced *"all it does is increase the pitch"*.

---

## Working the repo

```
node harness/mk2_syntax.js                       # ALWAYS FIRST. one second.
node harness/mk2_score.js --genre G --seed N [--out F] [--mid DIR]
MK2_HTML="Deckards Orchestrator MK2.html" node harness/render_audio.js OUTDIR '1:genre:auto'
node harness/mk2_stamp.js write                  # AFTER publishing, never before
```

Genres: `lofi`, `synthwave`, `dungeonsynth`, `fantasysynth`, `doomsludge`.

`composeSong` is **POSITIONAL**, and getting this wrong produced a false
finding that went into the backlog and had to be retracted:

```js
composeSong(seed, rig, genre, picks, pins, edits, traitRoll, traits, wantSec)
```

**Do not render audio for the owner.** He has said twice that it is a waste of
time and tokens. Measure and report numbers.

**Every claim gets a control.** Two renders of the same synthwave excerpt in the
same build differ by **25 LSB** — that is the program's own repeat-render floor,
not a regression, and a diff of that size means nothing without the control
beside it. lofi and dungeon synth sit at 1 LSB.

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
