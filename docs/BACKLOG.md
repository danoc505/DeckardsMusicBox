# THE BACKLOG — everything this project has said needs doing

*Collected 2026-08-03 at the user's request: "let's build a doc that
collects everything we are saying needs to be done or should be done."
Until now these lived scattered through HANDOFF-MK2.md session entries and
the research files, which is where intentions go to be lost.*

**HOW TO READ THIS.** Every item says WHY it is open and WHAT would close
it. Nothing here is a wish: each one was found by measurement or named by
a source. Items are grouped by what they cost, not by when they appeared.

---

## 0ae. RETRACTED SAME DAY — THE FOUR-ACT PLAN IS FINE; THE PROBE WAS WRONG

**This entry claimed `composeSong` never returns the genre's movements and
ignores `wantSec`. That was false and it is left here rather than deleted,
because a wrong finding that got written down is a lesson and a deleted one is
not.**

The probe called `composeSong({seed:1, genre:"doomsludge", wantSec:1200})`.
**`composeSong` is positional** — `composeSong(seed, rig, genre, picks, pins,
edits, traitRoll, traits, wantSec)` — so the object landed in `seed`, `genre`
was `undefined`, and the measurement was of the default genre's short record.
Called correctly:

```
composeSong(1, undefined, "doomsludge")
  28 sections, 472 bars, 19.8 minutes
  movements: ["setting out","into the deep","the fight","the long way home"]
```

Identical for `fantasysynth`. The four-leg plan, `setMachines`, `setMode`,
`setLean`, `roles` and `tempoArc` are all keyed on names the composer really
does emit. Nothing was broken and nothing needed fixing.

**The lesson, which is the only reason this row survives:** the probe was
believed over the program because its output was alarming. A measurement that
contradicts a working system should be suspected first — and the cheap check
here was one line, reading the function's own signature comment in
`mk2_score.js`, which states the positional order explicitly.

---

## 0ad. NAMED 2026-08-21 BUILDING THE FUZZ — the renderer is not deterministic

| what | why it is open | what closes it |
|---|---|---|
| **The offline render differs from itself across browser sessions** | MEASURED while A/B-ing the fuzz, and found only because the CONTROL was run: the **unchanged file rendered against itself** in two Chromium sessions gives **1,424 differing samples of 1,248,092, max 2 LSB of 16-bit, diff RMS −103.3 dB** below the signal. The before/after render of an actual change measured −103.0 dB — inside the noise. So every "byte-identical" and "render A/B holds it" claim in this file (the three-band EQ, the ducker, the channel tier, the matrix at defaults, Law 10's offline-equals-live) **is unverifiable by this harness across sessions.** It is ~103 dB down and inaudible; it is also the exact reason a real regression of this size could not be seen. | Finding the source — most likely a-rate parameter smoothing, denormal flushing, or FFT/convolver scheduling that varies with process state — and either fixing it or writing down, next to every byte-identity claim, that the claim is topological rather than sample-level. `render_audio.js` already renders `dup_` pairs *within one session*, which is why this never surfaced: same-session renders may well be exact, and the batteries only ever compared those. |

---

## 0ac. NAMED 2026-08-21 WHEN THE WAR HORN WAS DELETED — two

| what | why it is open | what closes it |
|---|---|---|
| **Nothing checks that a part-writing table can be played by the instrument it names** | The carnyx declared `range: [27, 77]` and a body of seven resonances, and was weighted **4 — the joint highest** — in fantasy synth's LEAD pool and pinned as the declared lead of a whole movement. Both facts were in the file, both were read the same day, and neither check exists to connect them: a mode's tune lands on one of seven pitches by accident, so the printout showed the war horn hammering **one pitch a bar** while every missed note came out thin and quiet by the model's own design. `signal: true` was honoured by the doubling engine and by nothing else. The instrument is gone; **the hole is not**, and `erWind` sits behind the same door. | A seam check that reads a declared `signal` or a sparse resonance set against the lane weights that can reach it, and refuses a table that puts a one-voice-at-a-time instrument on a melody lane. Not written — named here so the next table change has to answer it. |
| **lofi seed 17 will not compose** | `out of key, not in the chord, and does not resolve into the next one, in Bdev: keys2 82 bar 3`. PRE-EXISTING — reproduces identically on the pre-deletion file, so it is not the war horn's. It is the same class as the `Bdev` collision counted in §0aa's blend row, arriving through the single-genre door instead. | Diagnosing it. One seed in twelve; not understood, not claimed to be. |

---

## 0ab. NAMED 2026-08-20 DURING THE HOUSE-CLEAN — five, measured

| what | why it is open | what closes it |
|---|---|---|
| ~~**The tempo arc is a sawtooth, not a journey**~~ **DONE `2026-08-20v`** — sections collected into consecutive runs keyed on `(mv \|\| fn)`, one ramp a leg. The fight now goes 117→129 once instead of nine times. Runtime unchanged to the second, by arithmetic: normalisation makes the total `nBars/tempo` for any shape of the curve. lofi/synthwave/dungeonsynth byte-identical. | `makeTempoMap` computes `u = (b - s.startBar) / span` where `span` is the **section's** length, so a movement's declared pair re-runs in every section of that leg. Measured, fantasy synth seed 1: `setting out` ramps 70→78 **five times**, `into the deep` 90→106 six times, `the fight` 117→129 **nine times**. The owner heard it before it was found — *"it feels like it speeds up but then slows down."* The table's own comment calls it "a journey". | `span` and `u` computed against the MOVEMENT's span (first bar of its first section to last bar of its last), so a leg ramps once. Small change; read the per-section bpm table before and after. Deferred out of the cleanup pass to keep that diff byte-identical. |
| **40 sites still carry a bad global replace** | A find/replace put `the person playing it` where a noun used to be, and it was not one noun: most read as "the ear" (*"keep the ear off the kick"*, *"two things the ear can hear beating"*, in a function literally named `hear()`), but the blend and UI comments read as "the user" (*"a name the ___ could read"*). Six sibling sites that ate the word **ears** were fixed on 2026-08-20 — including a **misquotation of Sean Booth** under `[corpus:soundonsound]` and two broken `test/ears/LOG.md` paths. | Going through the 40 by hand. A blanket revert introduces fresh errors, which is why it was not done. |
| **The patch knob is redundant on pitched Erang machines** | All twelve pass `erangControls(0, …)`, so the knob is `min:0, max:0` and never moved a note. Since 2026-08-20 the machine plays the row named after itself, so the knob decides nothing at all. It is drawn on twelve panels. | Either widen it to the family (`erangPatches(fam)` already does this for the drum kit's `pSet`) so it becomes a real patch selector, or take it off the pitched panels. Either is a UI change and needs its own before-and-after. |
| **`mk2_score.js`'s banner is nondeterministic** | It draws its second seed with `Math.random()`, so the HEADER differs run to run even under `--seed`. It briefly read as a byte-identity failure on dungeonsynth seed 2 during the house-clean; the notes were identical. | Seed the draw, or print the drawn seed separately from the identity-bearing part of the header. Cosmetic, but it costs a false alarm every time somebody diffs the printout. |
| **`harness/render_audio.js` needs Playwright and says so nowhere** | It renders through a real browser's Web Audio and `require`s `playwright`, which is in `package.json` but not installed by default; and it needs an **absolute** path in `MK2_HTML` or `page.goto` throws `ERR_INVALID_URL`. Both cost a failed run before the first render. | A line in its header, and a clearer error when `MK2_HTML` is relative. |

| **The seven sustaining recordings are played as stabs** | The owner: *"each of the instrument files is 12 seconds long and should be used accordingly."* Measured off the bank, seven of the twelve are 12 s and LOOPED (3 leads, 3 strings, the pad) and really do hold — `src.loop = true` with the bank's loop points, so the drone's 500-second notes ring. The other five are finite one-shots (`erKeyMid` is 1.48 s). But over six records `erLeadMid` writes **344 notes at a mean of 1.00 s, max 2.00 s** out of twelve seconds, and `erLeadHi` averages **0.92 s**. Only `erStringsHi` stretches (mean 4.11 s, max 10.91 s) — and it is the one sitting on a `keys` slot rather than a `lead` one. | A decision the owner should make, because it is musical, not mechanical: either the lanes holding these recordings write long notes, or the 12-second recordings move to the lanes that already hold (keys / keys2 / drone) and the short struck ones take the articulated lanes. The roster and its measured lengths are now stated at the INSTRUMENTS banner so the choice is made against the truth. |

**AND ONE THING THAT IS CLOSED, WITH ITS RESULT WRITTEN DOWN BECAUSE IT WAS THE
OPPOSITE OF THE PREDICTION.** Six of twelve pitched Erang machines played
another machine's recording (`patch: "any"` drawing inside a `[0,0]` range).
Fixed 2026-08-20. It was predicted to be why the record has no weight. Rendered
both ways, 28 excerpts, the truth is the reverse: the bug was **manufacturing**
sub. Mean change after the fix — **40-120 Hz −1.77 dB, 1.5k-6k +2.06 dB**, level
unchanged at −0.10. An octave-down sampler makes artificial bottom and smears
the top off. The record's low end is now honestly thinner, and weight has to
come from something that is actually declared.

---

## 0aa. NAMED 2026-08-18 WHILE BUILDING THE PAD'S RHYTHM — three, measured

| what | why it is open | what closes it |
|---|---|---|
| **A held pad can ring past its own section** | PRE-EXISTING, and the pad-rhythm build made the worst case longer. Measured over 37,374 sustained notes, four genres, twelve seeds: **944 notes rang past their section before, 952 after** — so this added eight — but the worst overrun went **4.505 s → 9.032 s**. A nine-second pad written in one section and still sounding in the next is a chord under a harmony that did not ask for it. | `pad.cut`, which is the same three lines as `drone.cut` one role over. It would also truncate the 944 that were already doing it, which is a change nobody has measured — so it needs its own commit with its own before-and-after, not a tail-end addition to somebody else's. |
| ~~**`bassRoles` is declared by NO GENRE**~~ **DONE `2026-08-20v`** — fantasy synth declares a job per act (`A` drone, `C` riff, `B` riff, `lift` follow) through a new per-material form of `bassRoles` mirroring `form.setMode`, plus the `bassRiff` table §5 said was the blocker. Seed 7: **1 distinct pitch → 7**, bars holding ≤1 pitch **100% → 28.3%**, rhythms 2 → 12. Research: `the-bass-has-a-job.md`. STILL OPEN: the fight gains rhythm and not pitch because its harmony is two chords (item 3), and `lift` is inert because that leg has no bass lane. | The mechanism is built and nothing uses it. Its own comment in `buildBassLine` argues for it: *"a part that pedals for nine minutes is pedalling by default rather than by decision, and a pedal is supposed to be a decision AGAINST the other two."* Every genre plays one bass job for the whole record. | A table change per genre, weighted, and the printout read before and after. **It is about variety of JOB, not notes per bar** — `the-second-keyboard-rhythm.md` §4 has the sources that say density is not the problem. |
| **Six blend combinations still throw** | Down from 63 (`ec57366`), and every remaining one is a different class from the chord-set fault that was fixed: **3 `Avarlift` collisions, 1 `Bdev` collision, 1 "no keys voicing fits", and 1 `B: lead`** — that last one predates the developed restatement entirely. 6 of 432, 1.4%. | Diagnosing each. Not measured beyond the count, and not claimed to be understood. |

**AND THE REASON ALL THREE WERE FOUND BY ACCIDENT IS WORTH ITS OWN LINE.** The
blend fault above shipped in the published build for two commits because the
blend battery was deleted on 2026-08-18 and **the printout prints one genre at
a time**. That is not an argument for rebuilding a battery — the owner's ruling
stands, and the printout is what found the pad defects the battery never did.
It is an argument for asking the blend question *by hand* when a build touches
material selection, because nothing asks it for you now.

---

## 0zz. SIX GENRES WERE DELETED AT `2026-08-17`. READ THIS BEFORE BELIEVING ANY ITEM BELOW

The owner: *"We are going to delete the genres blade runner, plastikman,
hobbit synth, acid, jungle, and ambient. Our main focus is boxcar synth."*

**The program now has five: lofi, synthwave, vgm, dungeon synth, boxcar
synth.** Ask `MK2.genres()`; do not trust any count written in prose,
including this sentence one build from now.

**THE ELEVEN RACKS THOSE GENRES USED ARE KEPT.** The owner: *"All those racks
are being used."* The 808, the 303, the breakbeat chopper, the Shire flutes,
the drone rack, the Blade Runner room — every one is still on the rig menu and
still pickable by hand on any genre. A rack is an instrument, not a genre, and
deleting a genre must never quietly take instruments with it.

**Items in this file that named a deleted genre have been removed**, along
with their research sheets. What is left may still *mention* one in a dated
history entry — that is a record of what happened, not a live plan.

### 0zz.1 THE PRICE, AND THE BATTERY IS RED ON IT ON PURPOSE — **the top open item**

`mk2_test.js` fails **"every knob the conductor can move is one some genre
moves"** with **69 controls** named. That check was green before the deletion
because the deleted genres were the only ones automating them:

| unit | what is now unautomated |
|---|---|
| `flange` | all four — rate, depth, fb, mix |
| `dp4` | all eight — every A/B/C/D amount and level |
| `matrix` | 22 crossings, including every `*Flange`, `*DP4` and `*Barber` send |
| `tb303` | 13 engine knobs — drive, accent decay, track, slide, sweep, the sub's and the Reese's |
| `dronebox` | 9 — cut, res, peak, peakHz, air, bias, pan, panHz, panDep |
| `cs80` | 6 — pan, panHz, panDep, and all three aftertouch destinations |
| `mellotron` | panHz, panDep |
| `resonator` | fb, mix |

**Nothing is broken.** Every machine works, every knob turns, and the hand
still moves all of them — which matters, because the racks were kept precisely
so the hand could. What is gone is any genre that moves them *for you*: a
record made by the program alone now leaves those units sitting still.

**DO NOT MAKE THIS GREEN BY DELETING THE CHECK, OR BY DELETING THE KNOBS.**
The check is telling the truth and the knobs are ones the owner uses. The
honest close is to give a surviving genre a motion table for the units it
plausibly hosts — boxcar synth first, since the owner's standing complaint
about it is exactly this: *"we dont see to have things hooked up to fx for
evolution through texture"*. That genre already went from 6 automated controls
to a full table at `2026-08-16`; the flange, the DP4 and the matrix crossings
are the next tranche, and the deleted tables are still in git history as
worked examples of the shape.

**AND TWO MECHANISMS NOW HAVE NO CALLER.** `kit.poly` (the polymetre) and
`kit.answer` (the part that answers the pattern) are still in the engine and
no live genre declares either. `bassRiff`, `acidLine`, `chop`, `ladder`,
`phasing` and a handful more are in the same position — the engine can do
them, nothing asks. They were deliberately NOT ripped out: several are one
genre-table line away from being alive again, and the racks that play them
are kept. The battery's checks on the first two now report "nothing declares
this" and pass rather than failing on an empty subject. **If boxcar synth
wants any of them, it is a table entry, not a build.**

---

## 0za. FOUND BY EAR AT `2026-08-16j` — THE MEASUREMENT CLASS THIS REPO CANNOT SEE

*The most important entry in this file. A full critical audit of boxcar synth
ran with **every guard green** — route 6/6, journey 11/11, battery 187/2 — and
the owner found four faults by ear in a minute. Recorded as a CLASS because the
individual fixes are done and the blind spot is not.*

**THE CLASS: every probe in `harness/` measures EVENTS. None measures SOUND.**
`probe_repetition` counts note content, `probe_theory` counts wrong notes,
`probe_automation` counts knob travel, `probe_arc` counts density. All correct,
all blind to anything that happens between the composed event and the speaker —
filters, levels compounding through a voice, a sample never selected, a rack
that does not exist. Four defects lived there:

1. **The train was muffled by three stacked lowpasses** — a 2400 Hz `window`, a
   +8 dB shelf at 110 Hz, and the gramophone on top. A chuff is an ATTACK at
   1–4 kHz. Fixed (window 4300, travelling 3468→5075; rumble 8→5).
2. **`railRun1` had never played, in any record, ever.** Selected by
   `pitch % runs.length`, and the drone lane writes `pitch: 24` on every event
   it has ever made. Five seconds of shipped bank, never heard. Fixed.
3. **`atmos` and `weather` were not in `INSTRUMENTS` at all** — no controls, no
   panel, no rack. A fader with no machine behind it. Fixed.
4. **`V.atmos`'s fallback bus was still `vinyl`** — a role that missed its
   channel landed on the surface noise. Fixed.

**WHAT WOULD CLOSE THE CLASS**, and it does not exist: a probe that RENDERS a
window and measures the result — per-role contribution to the mix, spectral
balance, and whether a thing that is composed is actually *audible against what
is playing at the same time*. Task #102 ("a probe that measures levels AGAINST
each other") is the nearest existing item and is a subset of this. Until it
exists, **no green battery is evidence that a record sounds right**, and the
handoff should keep saying so.

**STILL OPEN, and it is the live example:** the owner cannot hear the conductor
(`railCall`). It decodes to 6 s of real audio (rms 0.133), is composed 36 times
per 10 records, and plays at gain 0.518 — *louder than the bass*, 3.4 dB under
the tune. Present and loud at every layer measurable without rendering. Either
it is masked, or the sample is not what its name says (§0y / task #23 is the
precedent for names not matching audio). **Both require a render to settle.**

---

## 0zb. BOXCAR SYNTH — what `2026-08-16` left open

Ordered by how much each changes the listening experience.

1. **SECTION LENGTHS DO NOT VARY, AT ALL.** Measured over 20 records: verse is
   16 bars in all 111 instances, chorus 8 in all 60, instrumental 16 in all 54.
   Every travelling leg is exactly 64 s and every town exactly 32 s. The terrain
   planner draws real variety (`farm secs:[35,30]`, `open [45,45]`) and **none
   of it reaches the ear**, because what is heard is the section grid. Fatal for
   a genre whose constitution is "a boxcar record has a geography" — a geography
   has distances. **This is the single largest open item in the genre.**
2. **The apex is the sparsest moment.** Boxcar is the only genre of eleven whose
   density FALLS from opening to peak (22.8 → 14.5 ev/bar, against plastikman
   13.8 → 43.3). `chorusPeak` makes the town the loudest declared moment and the
   town is where the roll stops.
3. **The bass is a pedal** — six notes in four bars, each twelve beats, and it
   re-strikes a pitch that is still ringing. `bassWalk: 0.65` is declared and
   inaudible.
4. **The tune has no phrases and barely any pitches** — measured D5 D5 D5 D#5 C5
   across four bars: three repeats, three semitones. Task #113 has the sourced
   model (2–2.5 bars of phrase answered by 1.5–2 of rest, AAB).
5. **The counter answers one call in ten** (174 notes to the lead's 1,751) and
   shares **100% of the lead's register**.
6. **Zero parameter locks.** The engine has them; boxcar declares none, against
   hobbit's 6. The one modulation shape that gives detail smaller than a bar,
   which is what a 16th-note roll of three pitches needs.
7. **No low transient in the kit** — three sounds carry it, `tkLow` sounds 6
   times in ten records, and nothing hits below the bass. The train has pitch
   and no weight.
8. **`keys` cannot use takes because it HOLDS** (task #112) — the flattest part
   of the record at ×6.9.
9. **The other ten genres carry the same length cap** — `probe_length --all`
   names 16 roles, e.g. dungeonsynth.ostinato at ×6.8 the playing for ×1.3 the
   music.

Tasks #111–#117 carry the detail. Full evidence:
`docs/genre-research/boxcar-audit.md`.

---

## 0z. FOUND WHILE BUILDING `2026-08-15v` — three checks that could not see

*Recorded here because each one is the same failure in a different place: a
guard that reports a pass while the thing it guards is broken. All three are
fixed; they are written down because the CLASS is not.*

1. **A range check is not a type check.** The grid seam check asked
   `n.step < 0 || n.step > 15`, and **both comparisons are false for NaN**.
   Boxcar synth's `flourish` pool held `[step, lane]` pairs where the hat
   builder wanted bare step numbers, so 51 events per six records were
   composed with `tSec` NaN and `gain` NaN — inaudible, invisible on the roll,
   and *displacing other events*, because a sort comparator returning NaN
   reads as "equal". That last part is how it surfaced: it made emptying an
   unrelated rack "move other roles". Now asks `Number.isFinite`.
   **Look for the same shape elsewhere** — any check written as a range.

2. **A scanner that knows one spelling covers only that spelling.** The
   battery's duplicate-motion-key check found a genre by a two-space-indented
   `name: {`. Boxcar synth is written `GENRE.boxcarsynth = {` at column zero,
   so the check had **never once looked at that table**, and it carried two
   duplicate machine keys (`echo`, `dronebox`) throwing away seven lanes.
   Now matches either form, and derives the block indentation instead of
   assuming it.

3. **A guard that asks the same question twice cannot fail.** The first
   version of "the running sound stops in every town" found towns by asking
   whether the section carried the `drone` role, then asked whether the drone
   sounded in them. Driven to failure on purpose it reported "5 towns, 0
   carrying the run" — the injected defect had *deleted the towns*. A guard
   has to name its subject in terms the defect cannot move.

**The standing lesson:** a new guard is not finished until it has been driven
to failure on purpose, and the failure has been read to check it failed for
the right reason.

---

## 0. THE ONE THAT OUTRANKS EVERYTHING

> ### AND IT NOW INCLUDES SIX BUILDS FROM ONE DAY
>
> `2026-08-04` shipped **`04b` through `04g`** — the Wurlitzer's depth, the
> record surface and the kick duck, chord quality from 1170 jazz tunes, the
> bass leaving the root, the widened out-of-key law, and jungle's chords.
> Every one measured. **Not one heard.** Two genres moved (lofi and jungle);
> the other five are byte-identical throughout.
>
> That is this section's own warning happening again, in a single day, and the
> person who did it should say so rather than let the next reader discover it.
> **The brief for playing them is the backlog.** The single
> question with the most riding on it is lofi's `qualities: 0.75` — how much
> jazz harmony the genre takes — because it is the biggest musical change of
> the six and it is one number.
>
> **`04h` is the seventh, and it is the one build here that does NOT need an
> verdict** — the roll is a display and moves no note; 2100 seeds byte-identical.
> It does, however, make the six unjudged builds *visible* for the first time,
> which is worth something to whoever finally sits down with them.
>
> **AND THEN `04i` AND `04j` MADE IT EIGHT, both on lofi and both loud.** `04i`
> gives the tune an electric piano instead of the house sawtooth — the biggest
> single change to this genre in weeks, and it moves no note. `04j` makes the
> tune stop between phrases and brings the hook inside the sourced note count;
> 300 songs moved, all lofi.
>
> **The open taste questions are listed in the backlog**, newest first,
> and every earlier build is inside the latest one — so playing the current
> artifact covers all of them at once.
>
> **⚠ AND THIS SECTION IS NOT A GATE. Corrected by the user, 2026-08-04:**
> *"What is a taste check? You cannot judge sound. I can always open the artifact
> and press play, there's nothing needed for that to be done."* This section
> had been read as a stop sign — a researched, ready mechanism (jungle's bass)
> was written up and deliberately NOT built, waiting for a ceremony that does
> not exist. **§0 means don't stack unverified taste guesses on each other. It
> does not mean stop building what the research and the measurements already
> justify.** If the research is there and the mechanism is buildable, build it.

**THE OWNER HAS NOT HEARD ALMOST ANY OF THE RECENT WORK.** The FDN room, the
whole stereo build, the matrix, the field, the stage, the flanger, the
DP/4, the snap — all measured, none judged. This project's own
precedent (the sax: every metric green, the owner refused it) says
measurements prove a thing EXISTS and never that it sounds good. **Nothing
should be built on top of this stack until it has been played.**

---

## 0a. WHAT IS STILL NOT BUILT — the whole open list, `2026-08-13`

> ### CLOSED SINCE THIS LIST WAS WRITTEN — `2026-08-14a` … `2026-08-15t`
>
> **The instruments play like instruments, `2026-08-15q`** — the owner's
> correction, and task #38 closed with it: a note is now capped at what the
> instrument can ring, chords written for a one-reed instrument arpeggiate,
> a note arriving while the hands are full ends the oldest, and a plucked
> instrument re-strikes a long note. Dungeon synth and hobbit synth records
> moved, which is the correction working.
>
> **Boxcar synth phases 3-5, `2026-08-15r`..`15t`** — the journey you can
> hear (brakes into town, the guard's whistle out, a real recorded conductor
> calling once a record, and THE PASSING with its measured swell, filter
> sweep, stereo crossing and doppler dip); THE MEDIUM (shellac at 78 with its
> 1.30 Hz once-per-revolution wobble, or an AM set at 5 kHz, both sourced and
> A/B measured, with the decay as an arc across the record); and
> probe_journey.js holding all nine of the genre's claims, driven to failure
> on purpose.
>
> **Boxcar synth, `2026-08-15n`..`15p`** — a NEW GENRE, the owner's own:
> the rails as the imagined past. The founding sheet, the BBC rail/scene
> payload, the hobo band (banjo/harmonica/whistle/slide/yard metal), and
> the genre table: tempo = train speed, towns silence the drums, keyShift
> dark→light, rail beds under the record. Existing genres byte-identical.
> Phases 3-5 open as tasks #91-#93 (journey boundary events, the
> gramophone/AM-radio decay, the guards).
>
> **The war horn answers, `2026-08-15l`** — the owner: *"make sure we are
> using the carnyx properly"*. Researched (carnyx-usage.md: signal blasts
> that time an assault, massed as independent noise, one voice per tube),
> then measured: dungeon synth had it on keys2 — a one-note tube voicing
> chord PADS. Moved to a new counter pool ([auto 7, carnyx 3]): six of 25
> records now carry the horn as the single answering line, pitches beside
> its measured resonances. And the doubling engine — which had drawn it
> onto the keys pad and the bass — now sees `signal: true` and DECLINES
> after the selection, so pool and rng stay byte-identical and only the
> two records whose drawn partner was the horn change. 21/25 DS seeds
> re-deal (the new pool draw shifts the rack stream); every other genre
> byte-identical, measured twice. Hobbit synth's apex carnyx PAD rung
> stays open with task #58.
>
> **The bass section, `2026-08-15k`** — the owner: *"improve the bass
> section with the bassoons and contrabassoons"*. The VSCO-2-CE bassoon
> sustains (CC0, same pinned commit) measured into BRASS_WT.bassoon by
> analyze_bassoon.py, and the contrabassoon grew the SECTION dial: the
> recorded bassoon on the same line an octave up at Rimsky-Korsakov's
> inferior level ("doubling, an octave lower, the bass of the group to
> which it belongs" — so the 16-foot line gets its 8-foot edge). DS rides
> it toward the apex. Events identical across 250 songs; the dial measured
> −40.6/−40.1/−39.2 dB off/default/full on the bass alone. The VSCO shelf
> note shortens by one: the bassoon is no longer waiting.
>
> **The spectrometer, `2026-08-15j`** — the owner: *"a spectrometer and
> use it for equalizing"*. A 1/3-octave RTA (25 Hz–16 kHz, log/log,
> −60..0 dB, peak-hold, pink-noise-flat band sums) derived into the desk's
> centre section as a machine beside the bus compressor, tapped off the
> master as a dead-end analyser. The desk's three EQ bands are drawn on
> the glass from the LIVE GRAPH's own filter nodes, so the spectrum and
> the equalizer are one instrument. Zero notes moved.
>
> **The owner's review, `2026-08-15i`** — three faults, all measured: the
> drone fader dead since the lane was born (no MIX_ROLE_BUS entry — fixed,
> channel in front of the keys bus its audio always took; A DRONE BUS OF
> ITS OWN IS STILL OPEN, it is a matrix row and belongs with the serial-
> routing column work); the gurdy wheel restarting per note (tied notes
> enter at the loop) with its drone strings now a LAYER under the drone
> rack (dronebox.strings) instead of a rival machine; the taiko choked at
> 1.6 s and off by a 19 dB lane spread (released 0.35 s, per-drum trims
> from the A/B's own corrections).
>
> **The mixer names every part's instrument, `2026-08-15h`** — a dropdown
> on every part strip, first option always what is actually playing (read
> from the record's events), the drums strip naming its kit. Same PICK /
> recompose doors as the rack pickers.
>
> **A rack for every part, `2026-08-15g`** — counter and ostinato slots
> (the last two rig-only parts), every pitched box pickable per part, the
> + row grows by itself. Dungeon synth's pools now deal the contrabassoon
> (bass), the gurdy drones (drone lane) and the hurdy-gurdy (keys2), all
> register-neutral, measured. probe_reachable's pick collector derives
> from rackSlots() instead of a stale five-slot literal.
>
> **Three recorded instruments in one day, `2026-08-15f`** — the owner's
> pick: taiko (SCC v1.0, CC BY-SA, layered by measured RMS, drawn 6/4 onto
> dungeon synth's kit), contrabassoon (Philharmonia, a guest in BRASS_WT,
> beside the synthesised bassoon, no pools), and a REAL hurdy-gurdy (the
> MidiGurdy project's French gurdy soundfont, CC BY-SA — wheel, keybox
> clicks, chien on accents, and its drone strings on the drone rack).
> Still unbuilt for want of a recorded source: the chien's sustained growl,
> cup mute, bass trombone. Still unused and waiting in the same CC0 repos:
> VSCO-2-CE's oboe/clarinet/strings/pipe organ and its ANVIL (the
> DS sources' own instrument), VCSL's Renaissance organ, recorder consort,
> psaltery, rope-tension snare. (The VSCO bassoon left this shelf in
> `2026-08-15k` — it is the contrabassoon's octave-above partner now.)
>
> **0a.7 The brass — CLOSED, `2026-08-15e`.** The owner picked it: *"Brass.
> Make sure to do research about how to arrange brass. Make sure to look
> online for free brass open source that we can use."* Recorded patches
> landed exactly as the rule demanded: VSCO-2 Community Edition (CC0-1.0,
> `sgossner/VSCO-2-CE`, commit `4403009`) analyzed by
> `corpus/analyze_brass.py` into `BRASS_WT` — horn, trumpet, tenor trombone,
> tuba and three RECORDED mutes, per pitch per dynamic, octave verified by
> measurement, not name. `V.brass` morphs the recorded pp/mf/ff spectra so
> the crescendo is a timbre event (cuivré, measured), and the CHAIR dial at
> SECTION deals notes to members by register. It plays from the new
> `bastion` rig — the citadel with the recorded section in the second chair,
> staged only by dungeon synth, so hobbit synth and every other genre are
> byte-identical (measured, 3000 snapshot rows; 91/300 dungeon synth records
> move, 64 pure voice renames, 27 doubling redraws where the range doctrine
> refuses a line the section cannot play). The arranging sheet is
> `docs/genre-research/brass-arranging.md`; the guard is
> `harness/probe_brass.js` (11 checks). What was looked for and NOT built is
> in that sheet's §8: no cup mute, no bass trombone, no gliss/rips — no
> recorded source, and the §0a.7 rule holds.
>
> **Prog-techno is deleted. Ambient replaces it.** The owner's call, and the
> table is gone from `GENRE`, not commented out —
> `docs/genre-research/prog-techno.md` is kept with a withdrawal note at its
> head, because several of its mechanisms (the structural solo, the drawn
> matrix vocabulary, poly on pitched parts) outlived the genre and are still
> cited from it. `docs/genre-research/ambient.md` is the new sheet, written
> against `how-a-drone-evolves.md`'s own ranking: `form.roles` is the whole
> form (the drone alone, then a bed, a figure, a voice, and a bridge where the
> drone itself LEAVES); every LFO pair on the table is coprime.
>
> **The drone is a real lane now, on every genre, not a bass engine.**
> `INSTRUMENTS.dronebox`, `SLOT_OF.drone`, its own mixer strip, MIDI track and
> rack slot. Before this it was `V.drone` — three saws and a lowpass, living
> inside the 303, reachable from one rig (bladerunner), longest held note
> 16.55 s, and it was ON THE BASS SLOT, so a genre had to give up its bottom
> end to have one. Dungeon synth and hobbit synth both declared
> `bassStyle: "drone"` and put the plucked `V.bass` on the lane instead —
> longest held note 4.80 s and 2.54 s, i.e. no drone at all, which is what the
> owner's own ear caught on `15b` after the audit table had said so in writing
> and nobody had acted on it.
>
> **Dungeon synth's drone, done twice.** The first attempt (`15b`) DECLARED the
> role inside `form.roles` and moved the genre's keys 597 → 732 notes and its
> bass register besides — adding a foundation re-arranged the whole record,
> because the rest/strip/thin draws and the register allocator all pick from
> whatever is in `form.roles`. Reverted whole (`15c`), then rebuilt as a
> DECREE (`15d`): a genre that declares `drone` without naming it in
> `form.roles` gets it added to every section AFTER every draw over the active
> set has already run. Twelve seeds, every non-drone event SHA-identical to
> the pre-drone build; 37–41 drone notes added per record. Ambient keeps the
> explicit `form.roles` path on purpose — its bridge removes the ground, which
> is the whole point of that genre's form.
>
> **Three pieces of Mutable Instruments' own source code are ported, not
> guessed at.** `marbles/random/random_sequence.h`, `marbles/random/
> t_generator.cc`, `tides2/poly_slope_generator.h`, fetched raw from
> `pichenettes/eurorack` (MIT, Emilie Gillet, copyright notice carried in the
> comments). The first version (`14a`–`14e`) was a re-implementation from the
> MANUALS and got Marbles' déjà vu backwards: the real mutation probability is
> `p = (2·dejavu − 1)²`, zero at the notch, and below it a mutation REWRITES a
> loop slot rather than drawing fresh noise. `MarblesSequence` runs the ported
> algorithm now; the t-section's drum-pattern bank (plus Bernoulli and
> clusters, the module's other two rhythm models) drives ambient's figure;
> Tides' SMOOTHNESS is corrected to bidirectional-from-clean-centre.
>
> **The resonator is built — closes the item in `how-a-drone-evolves.md` §P.3
> and the "infinite feedback / very short delay time" pair from the owner's
> own eurorack list.** A comb at 1/f seconds, feedback to 0.99, wired serially
> on the echo's return (the dub route) rather than as new matrix plumbing. The
> echo itself cannot be this by construction — shortest delay ~132 ms, feedback
> capped at 0.85.
>
> **Scenes are built; serial routing is not.** STORE A / STORE B and a
> crossfader on the modulator bank's glass, morphing every hand TRIM offset
> between two captured desk states — Frames' idea, writing TRIM and nothing
> else so the record underneath is untouched. The other Octatrack idea on the
> owner's list, a track processing another track's audio, is still open: the
> honest design is a RES column on the matrix, and it is not built because the
> matrix's builder, `routeBaseFor` and `probe_wiring` all walk the column list
> by hand — a rushed column is a broken desk.
>
> **And the modulator bank was found half dead.** `rideBus` and `motionAt` both
> returned early for any destination the current GENRE did not itself
> automate, so a hand-patched bank slot on an unautomated destination did
> nothing — silently, and differently per genre. Proved by render A/B:
> −100 dB (numerical dust) before the fix, −43.7 dB (real audio, in line with
> a known-good laned destination's −37.6 dB) after. The bank's destinations
> went from 12 to 22 in the same pass — every part bus's room/echo/spring
> send, the echo→spring dub route, the compressor's threshold (now genuinely
> ridden rather than set once), and the resonator's own ring and mix.
>
> ### CLOSED SINCE THIS LIST WAS WRITTEN — `2026-08-13a` … `2026-08-13d`
>
> **0a.1, the grid.** A genre declares `metre` and everything derives from it:
> steps per bar, beats per bar, steps per beat, and the accent hierarchy.
> `METRE_DEPTH` turned out to be the published Longuet-Higgins & Lee weight tree
> byte for byte (Fitch & Rosenfeld 2007 Fig. 1), so 4/4 was already right; five
> more tables were derived under Lerdahl & Jackendoff's MWFR 4. The research
> also found a bug no ear would have: `METRE(bite)` divided by a hardcoded 4
> while four of six tables top out at 3. `probe_meter.js` guards it, including
> the one failure most likely here — 6/8 is DUPLE, and a table reading a beat at
> step 4 is a waltz calling itself a jig. **300 of 300 records byte-identical**:
> the default is 4/4 and is proven to be one.
>
> **The inheritance.** `merge(GENRE.dungeonsynth, {...})` is gone. A deep diff
> put the real figure at **69 silently inherited paths**, not the 24 top-level
> ones — a partial override like `form` or `motion` inherited its missing
> siblings too. Converted, then proved: **300 of 300 byte-identical**, in the
> merge's own key order, because `Object.keys(G.bridgeProgressions)` at the
> bridge's mode pick reads JS object key order and appending moved ten records.
>
> **The values.** The chorus was moving at double the genre's stated harmonic
> rhythm in ~two thirds of records; major and mixolydian had no chorus row at
> all; carpathian still carried a one-chord vamp; the energy column was written
> to *prevent* a crescendo; three section types shared one cast; the epic lever
> had the highest sit-out rate in the table; wow and flutter sat below the
> audibility floor; the playing was tighter than a measured string quartet.
> **All 30 hobbit synth records moved and no other record did.**
>
> **The drone.** Hobbit synth had zero parameter locks and 1.1% of a knob's
> travel inside a bar. It has six and 2.8%. **And the premise was then checked
> and is half wrong** — see 0a.14 below, which is new.

### 0a.14 THE DRONE STILL DOES NOT EVOLVE, AND THE CURE IS RANKED

`docs/genre-research/how-a-drone-evolves.md`, written specifically to test a
claim I had already built on:

> *"Parameter locking cannot be a long-form evolution mechanism **by
> construction** — a value stored against step 7 recurs on step 7 of every bar,
> so a mechanism with a period of exactly one bar carries no information at the
> 200-bar timescale."*

Elektron, who coined the term, sells it as *"an ultra-fast and detailed way of
**sequencing**"*. Its own long-form answers are Song Mode, per-track pattern
**length**, and trig conditions — `4:7` has a period of seven bars. And the
hardest fact in the sheet: **no parameter was automated in *Music for Airports***.

Four traditions with no shared ancestry — Javanese gamelan, Scottish pibroch,
north Indian alap, baroque ground bass — each sustain 10–20 minutes over a fixed
foundation, and all evolve by **discrete countable events**, none by a
continuously moving quantity. Ranked, with the number of traditions naming each:

| | mechanism | |
|---|---|---|
| 1 | parts entering and leaving | five |
| 2 | cycles whose periods do not divide | four, with numbers |
| 3 | variation events over an unchanged ground | four, formalised |
| 4 | density change | irama, pibroch doublings |
| 5 | register expansion | alap *vistar* |
| 6 | filter movement at the **section** scale | dub techno, MIR |
| 8 | **per-step parameter locks** | Elektron only, and it disclaims them |

And the number that reorders the question: **slow change deafness** — Neuhoff et
al. 2015, continuous speech shifting **three semitones** and ~50% of listeners
failing to notice. Three hundred cents against a 3-cent JND. The JND is the
wrong ruler for long-form change.

**What this means for the build**: the locks stay — they are audible (`tone`
spans 5.17 octaves; a lock of ±0.05–0.10 is a 1.2–1.7× step-to-step cutoff
ratio) and they make one bar differ from the next, which was genuinely missing.
They do not make bar 200 differ from bar 4. Mechanisms 1–3 are the real build
and none of them exists.

### 0a.15 A DRAW THAT READS JAVASCRIPT OBJECT KEY ORDER

`Object.keys(G.bridgeProgressions)` at the bridge's mode pick. Re-ordering a
config object is therefore not cosmetic — it is a draw. Found because a table
conversion that changed nothing but key order moved ten records and exactly one
pitch, 76 to 75. Nothing else in any record differed, which is precisely how a
fault of that shape hides. **Every other order-dependent read in the file is
unaudited.**

### 0a.16 THE BLEND'S OUT-OF-KEY LEAD NOW HAS A REPRODUCTION

`mk2_test`'s "blended genres compose" has carried one failure for many builds
and I have been calling it pre-existing and stepping past it. Two instances now,
and printing the chart at the throw shows they are **the same defect**:

```
lofi+dungeonsynth w=0.75 seed 2 : mode=minor root=2  [5,5,0,0]         lead 80 bar 3 of B
lofi+hobbitsynth  w=0.75 seed 4 : mode=minor root=10 [2,2,5,5,0,0,0,0] lead 71 bar 3 of B
```

Both minor, both the chorus material, both bar 3, both a lead note out of key,
not in the chord, not resolving by step. Neither genre throws un-blended.
**Likely owner**: the melody-target snap in `buildTheme` runs *after* the
departure law has narrowed the move, so a snapped note escapes "a dissonance
must step" — two owners of one pitch. Do not fix by widening the tolerance; this
file's own comment records that the old 99% was hiding exactly one bug.

**STILL OPEN, and now the oldest unfixed defect named in this file.**
Dungeon synth's `15d` rebuild changed which bars its materials land on, which
moved WHERE the same two pairs (`lofi`×`dungeonsynth`, `lofi`×`hobbitsynth`)
hit the throw across the blend slider's weights — same two pairs, same class
of defect, not a new or worse one. `mk2_ui.js`'s own blend drag now reproduces
it on nearly every run rather than intermittently, so the repro is cheap
whenever someone does pick it up. **AND THE OWNER HAS RULED ON THE PRIORITY,
2026-08-15: "thats not a concern there are better things to tackle."** So:
recorded, reproducible, deliberately not next. Expect the battery's blend
check and `mk2_ui` to carry this red until it is; that is the known cause,
not a new fault.

*Asked for in as many words: "add what everything we have failed to implement
to the todo file". This is that list, on the branch `claude/code-review-6jd9cz`,
current as of build `2026-08-15t`.*

**EVERY NUMBER BELOW WAS MEASURED TODAY, not remembered.** The probes that
produced them are named at each item so any of it can be re-checked in one
command. Where something is written down in a research sheet and not in the
program, that is said plainly rather than described as "partial".

---

### 0a.1 THE BIGGEST ONE: the grid is four beats to a bar, and two of the four source themes are not

`lotr-themes-measured.md` §5.2. **The Shire theme is in 3/4 and Rohan is a 6/8
jig** — the travelling meter an overworld genre most wants, and the one the
overworld research suspected and could not source until the notation was read.

The program's grid is sixteen steps to a bar, a four-beat assumption baked deep
enough that **"the meter is 3" is not expressible anywhere in the file**. Not
in a genre table, not in a material, not in a section. It would touch stage 3
through stage 5. Noted when the transcriptions were read and never acted on.

This is the largest outstanding item by a distance, and it is the reason a genre
built from a 3/4 theme is being generated in 4/4 and nobody said so.

### 0a.2 The melody has no interval budget — one hardcoded line for every genre

MEASURED `2026-08-12i`, 10 genres × 20 songs, lead line:

| genre | step | repeated pitch | leap | distinct pitches, 20 whole songs |
|---|---|---|---|---|
| hobbit synth | 41% | **27%** | 32% | 20 |
| dungeon synth | 42% | **31%** | 28% | **13** |
| lofi | 61% | 16% | 23% | 23 |
| bladerunner | 44% | 14% | 42% | 20 |

The cause is one line in `buildTheme`, identical for every genre in the file:

```js
move = wpick(rng, [[0, 2], [dir, 5], [dir * 2, 2], [-dir, 2]]);
```

Four outcomes — stay, one step, two steps, one step back — **and no leap at
all**, ever, in any genre. That is principle 1 exactly: a dimension shaped like
a choice, holding a constant. It is why seed 1 of hobbit synth reads as a
two-note wobble repeated across a whole record even after the sampled repeats
were merged out of it, and it is a different fault from the repeat, fixed
separately in `2026-08-12i`.

**What would close it**: `theme.moves` as a declared weighted palette per genre,
drawn in a named substream, with the existing four as the default so no genre
moves that does not declare one. Then hobbit synth's own from the notation
(0a.3).

### 0a.6 `roleGain` cannot express the loudness table — it is dynamic-dependent

`score-craft.md` §3. Rimsky-Korsakov, exact: **at forte** 1 trumpet = 1 trombone
= 1 tuba = 2 horns = 4 woodwinds; **at piano ALL winds are equal.** Berlioz
adds that one synth string-section voice = 1 wind voice at *p* and 2 at *f*, so
a five-part string layer weighs ten wind voices at forte.

`roleGain` is **one fixed number per role**, so it cannot express a ratio that
collapses with dynamic. That is a structural gap, not a wrong constant, and it
is the arithmetic behind "we have bad levels and not using frequences well" and
behind winds vanishing under pads.

### 0a.7 The brass, and a dungeon-synth tutti that is actually orchestral

**CLOSED, `2026-08-15e` — see the closure block at the head of §0a.** The
recorded patches landed (VSCO-2 CE, CC0) and the section plays from the
`bastion` rig's second chair. The rule this item stated — no brass invented
from a description — held all the way down: even the mutes are recorded
spectra, and the articulations with no recorded source (cup mute, gliss,
rips) stay unbuilt and are listed in `brass-arranging.md` §8. What remains
of the ORIGINAL ask is the full §10 tutti object (three-of-four families,
the §12 escalation), which is task #58's Phase 4, not this item.

### 0a.8 The sample pack's real coverage gaps

Roots parsed from the bank's own names; played range measured over 10 genres ×
3 seeds:

| family | detected roots | played | verdict |
|---|---|---|---|
| `bardFlute` | B4 C5 C6 C#6 | 69–87 | 2–3 semitones outside its sampled span — **ordinary sampler behaviour, not a fault** |
| `bardWind` | C3 C4 C5 D#5 C#7 | 63–87 | **a two-octave hole, C5 → C#7** |
| `bardPluck` | C2 C3 C4 | 48–67 | covered |
| `erangHarp` | **none detected** | 50–78 | **28 semitones with no pitch reference at all** |

Two real faults: `erangHarp` carries no detected root in any sample name yet is
played across 28 semitones — whatever it is pitched against is not a measured
root, and `harness/erang_bank.py` already detects roots and carries
`CORRECT_ROOT` for hand fixes, so this may be measurable from the audio without
new samples. And `bardWind`'s two-octave hole means mid-range notes are stretched
a long way from the nearest sample.

*(This item also carries a correction of my own: I first claimed `bardFlute` was
"played five semitones below a whistle's lowest note", measured against a D
whistle's D5. The pack's own roots refute it — the recorded instrument goes down
to B4. I picked a reference instrument and then found a fault against my own
pick.)*

### 0a.10 Re-audit every declared fact for voices that quietly ignore it

`ev.tied` was computed in stage 5, carried to stage 6, and **silently dropped by
`erangVoice`** because that voice has its own envelope and never called the
shared `adsr`. I verified the helper and not the callers.

The same shape of hole may exist for `holdSec`, `wow`/`flutter`, `art`, `vib`,
`cut`, `sam` — anywhere a voice with a bespoke path reads some fields and not
others. **What would close it**: a probe that renders one voice at a time with a
flag on and off and asserts the audio DIFFERS, rather than trusting that a field
reaches the door.

---

### 0a.11 THE RESEARCH THAT IS WRITTEN DOWN AND NOT IN THE PROGRAM

Counted today, mechanically: `score-craft.md` has **56 sections and 11 of them
are cited anywhere in the program** — §2, §3, §7, §15, §17, §39, §41, §48, §53,
§56. `lotr-themes-measured.md` has one section cited, §2.

A citation is not proof of implementation and its absence is not proof of the
reverse — but **45 uncited sections of a sheet written specifically to be built
from is the shape of the problem**, and the named ones below were checked
individually:

- **§47 — the researcher's own ranking of what changes most for least code**,
  and item 2 is still open: *"chords dealt out across voices instead of struck
  as blocks"*, plus §4's voicing rules to decide who gets what. Item 1 (a
  `reattack` boolean) is effectively done via `tied`; item 3 (the breath budget)
  is done, §41.
- **§42 — a wind plays ONE note, so a chord is an ASSIGNMENT PROBLEM.** The
  program hands a wind a chord and lets it play all of it. This is the same
  fault as §47.2 seen from the instrument's end, and it is the unfinished half
  of "you arrange everything like it's a piano".
- **§49–§52 — the bow.** A bowed player holds two notes (three independent
  sources agree; the most load-bearing rule in the sheet); the bow has a clock
  and it is dynamic-dependent; a section has infinite sustain and a soloist does
  not; what keeps a held string chord alive. None expressible today.
- **§55 — the pedal harp is a state machine.** Not modelled. §53 (rolled by
  default) and §54 (the medieval instruments, easier to model) are built.
- **§9 — Rimsky-Korsakov's five re-orchestration operations**, §10 tutti,
  §11 the scarcity budget, §12 four escalations with numbers, §13 the ceiling on
  "add more voices". The ladder re-scores a theme; none of these five govern how.
- **§16 — chromatic mediants, as an actual lookup table.** Written out and
  unused.
- **§21 — the pastoral and the hunt, topic theory with hard constraints**, and
  §19 mode and affect, §20 the walking tempo, §22 written to be heard a thousand
  times, §23 the seam map.
- **§43–§46 — articulation speed with numbers, register as character, the
  flute's idiom of interruption, the tin whistle.** §46 carries a warning that
  is this project's own.

**AND THIS IS THE HABIT THE LIST IS MADE OF.** Research is commissioned, it
comes back with numbers, one or two sections become table entries, the sheet is
committed, and the sheet reads as done. Nothing reconciles a written finding
with whether it is reachable in the program — the same gap `probe_reachable.js`
was built to close for *declarations*, one level up, for *research*.

---

### 0a.12 WHERE A GENRE STILL COLLAPSES TO ONE VALUE

`node harness/probe_palette.js 40`, run today. PINNED means the table offers a
choice and the music never takes it:

| genre | dimension | |
|---|---|---|
| hobbit synth | `keys pick` | 1 of 7 declared — always `erangHarp` |
| hobbit synth | `lead pick` | 1 of 4 declared — always `bardFlute` |
| acid | `groove` | 1 of 2 declared — always `even` |
| vgm | `tempo` | 25 of 75 declared (THIN) |

The two hobbit synth rows are **a hole between two probes, and it is worth
naming**: a laddered slot's `machines` pool decides nothing, so
`probe_reachable.js` deliberately exempts it — and `probe_palette.js` then finds
the pick pinned. The file's own comment says as much: *"the twelve names on these
three lines are the ONLY machines that ever play keys, lead or keys2 here… the
`machines` pool further down never wins one of these lanes."* So hobbit synth's
`machines.keys` (7 rows), `machines.lead` (4) and `machines.keys2` are dead
config that no check will ever flag. Either delete them or make the pick read
the ladder.

And ONE COLOUR — a weighted list of alternatives holding exactly one entry:

- `groove.styles = "even"` in **8 genres**. Only lofi and acid declare more, and
  acid never takes it (above). The program has one groove.
- `bridgeProgressions = [0,0,0,0]` — plastikman (dorian, minor, phrygian) and
  acid (major). **The drone survives in the bridge harmony** after being killed
  in the main progressions.
- `keysChar = "rhodes"` and `leadChar = "synth"` in 9 genres each.
- `counter.style` is a drawn list in dungeon synth and hobbit synth and a bare
  scalar in synthwave, vgm, bladerunner and prog-techno.

---

### 0a.13 THE FAULT CLASS THIS LIST KEEPS BEING MADE OF — and the newest instance

Every item above is one of two shapes, and both have now been named enough times
to be treated as the default suspicion rather than a discovery:

1. **A NAME THE CONFIG MENTIONS THAT NEVER HAPPENS.** The bridge, the ladder
   rungs, the machine pools, the rack, `ev.tied`. `probe_reachable.js` closes
   this for declarations; §0a.11 is the same fault for research and nothing
   closes it.
2. **A DIMENSION SHAPED LIKE A CHOICE WITH ONE OUTCOME.** The drone, the
   one-note solo, the single scale, `groove.styles`, the theme's move
   vocabulary. `probe_palette.js` closes this for anything the table declares as
   a list; it cannot see a constant that was never written as a list at all,
   which is exactly what 0a.2 is.

**The newest instance, and the most expensive, was answered wrongly four times
before it was answered at all.** A sampled voice re-firing the same pitch was
reported five times. The first four answers each changed how the repeat was
*dressed* and left the repeat there: a slur on a one-shot buffer; a whistle cut
that turned a bare repeat into a decorated one; drum round robins (a different
problem with the same name); and a `lines.repeat` rule that measured **onset
distance instead of silence** and so waved through the exact note being
complained about — a whistle held 1.047 s and struck again 1 ms later has a
full second between its onsets and no gap at all.

Fixed and guarded in `2026-08-12i` (`harness/probe_repeat.js`, in the battery).
**The lesson that belongs in this file is not the fix.** It is that four
consecutive answers were checked by reading the code that had just been written,
and the only thing that ever caught the fault was printing the notes. A check
that has to be remembered is not a check.

---

## 0b. OPEN AFTER 2026-08-07 — the session that added the mixer and the phrase

Everything here was found or left open on `2026-08-07` (`07a`…`07f`). Each says
why it is open and what would close it.

### 0b.1 ~~The mixer's sends on the drum kit are pre-fader~~ **FIXED `2026-08-07g`**
*Was: stated, not fixed. The user brought it back as part of "the mixer needs to
be the master for all volume".*

The per-drum echo/reverb/gate sends tapped `mk`, inside the kit and ahead of the
channel strip, so pulling the drums fader took the dry drums down and left their
echo and reverb where they were — a kit that got **wetter relative to itself**
the further you pulled it down. The old note called that "how a desk with a
sub-mixer on one channel behaves", which is true of a sub-mixer whose OUTPUT is
all the parent fader sees; here the sends leave for the master effects directly,
which is not that topology.

**CLOSED**, keeping the per-drum amounts (the reason the sends are inside the
kit at all): each drum still has its own `echo`/`verb`/`gate` gain, and all of
them pass through one mirror per destination whose gain follows the DRUMS
channel — fader, mute and solo alike. Per-drum amount × channel level, which is
what post-fader means. Measured on the glass: channel `0.0151`, echo `0.0151`,
verb `0.0151`, gate `0.0151`; muted, all four `0`. At rest every mirror is
`1.0`, so an untouched program is the graph it always was, and all eight genres
still render repeatably (worst −90.0 dB against a −80 dB threshold).

### 0b.6 ~~The mixer has no master strip and no solo~~ **FIXED `2026-08-07g`**
Master fader, master meter, and mute + solo on every channel. Research and
sources: `docs/genre-research/mixing-desk.md`. Three things worth carrying:

- **The master is past the LIMITER**, not in front of it, because the effect
  returns land on `g.post` and had no downstream control a hand could reach —
  so no fader position could take them away. A fader in front of a limiter does
  not answer a question about volume; the limiter absorbs it.
- **Solo is solo-in-place, not PFL**, stated as a departure: PFL needs a
  separate monitor bus and this program has one output.
- **The meter carries the gain-staging marks** (−12 dBFS working, −3 dBFS
  ceiling) because §1 of that research is the actual answer to "things are too
  loud": eight strips at unity sum about **9 dB** hotter than one, and the
  number of parts playing changes section by section, so a chorus is louder
  than the faders say for reasons that are arithmetic rather than musical
  [corpus:prosoundweb]. **STILL OPEN, and it is the interesting half: nothing
  yet COMPENSATES for that.** A master meter lets you see it; it does not fix
  it. Whether the program should normalise for part-count is a real question
  and has not been researched.

### 0b.10 THE MIXER AND THE ROLL NOW SHARE ONE COLOUR TABLE — `2026-08-07g`
The user asked for the desk to be colour-coded to match the note display. It
calls `rollHues()` rather than copying its numbers, so the two cannot drift; the
precedent is the SSL 4000 E, where the EQ knob colours identify which circuit is
fitted rather than decorating the panel [corpus:solidstatelogic; corpus:uaudio].
**One honest edge:** `rollHues()` is keyed on `MIDI_TRACK`, which has seven
entries against the mixer's eight — `tape` is the record surface, not notes, so
it has no line on the roll and gets a neutral rather than an invented hue.
**Closing that fully** would mean deciding whether the record surface belongs on
the roll at all, which is a display question nobody has asked yet.

### 0b.11 A CONTROL DRAWN TWICE ONLY REFRESHED THE COPY YOU TOUCHED — FIXED `2026-08-07g`
The user: *"The KAOSS pads are disconnected from their controls this is wrong."*
The pad always reached the SOUND; what was broken is that `echo.tone` is an axis
of the pad **and** a knob on the echo's panel, and a hand on either refreshed
only itself — so the pad read 7950 Hz while the machine's knob read 1800 Hz
about one number. **It only showed while STOPPED**, because `refreshLive()`
sweeps every knob per animation frame during playback and papered over the hole
sixty times a second; and no probe saw it because `probe_pads` drives the pad
and then asks the audio, which was never wrong. `handMoved(...keys)` refreshes
every element that displays a key. **The stereo field had the same defect** and
was found while fixing this one. Guarded in `mk2_ui.js` with the transport
deliberately stopped.

### 0b.2 Five Erang patches read one octave out — PROBE, NOT BANK
`probe_erang.js` flags `erangStrings#18` and `erangHarp#0/#6/#8` failing ONE
note each by exactly an octave. Measuring the decoded PCM directly says the
stored roots are right, so this is the probe's pitch reader picking a
neighbouring autocorrelation peak. Written down so nobody "fixes" four correct
numbers. **Closing it** means an octave-safe reader in `probe_erang.js`.
(Pad_03_C was genuinely 645 cents wrong and IS corrected in the bank, with both
measurements recorded at the head of `ERANG_INDEX`.)

### 0b.3 The rendered-audio battery still sits at 18 failures
Unchanged and unattributed. See §1. **Do not raise the ceiling.**

### 0b.4 Parallel fifths are declared and inert in dungeon synth
`parallels: 0`, and the table says why at length: the organum appetite and the
user's request for shared notes pull in opposite directions, and once the
progressions moved to third-motion the parallel case stopped occurring at all —
0.0% of 50 bar-to-bar steps, dial on or off. **Closing it** means drawing BOTH
kinds of root motion and applying the appetite only to the stepwise ones.

### 0b.5 The A-weighting filter is 0.7 dB out at 8 kHz
`probe_stems.js` builds the IEC 61672 curve from the standard's poles and checks
itself against five published points. Everything at and below 4 kHz is inside
0.1 dB; 8 kHz reads -1.8 against -1.1, which is the known cost of a plain
bilinear transform near Nyquist. Prewarping each section individually was tried
and made it worse. Charged where it does not matter (a bass question) and the
check's tolerance says so out loud. **Closing it** means transforming the
sixth-order function as a whole rather than as six first-order sections.

### 0b.6 The mixer has no master strip and no solo
Seven channels and no master fader, no mute, no solo. The roll's legend already
does a visual solo; the audio does not. **Closing it** is a small amount of UI
against the same `MIXTRIM` contract.

### 0b.8 THE INSTRUCTIONS TOLD A SESSION TO TEST AN UNTOUCHED PROGRAM — FIXED
*Found 2026-08-07 by the user, on a session that had done exactly that.*

A fresh session ran `mk2_test` **twice** before changing a single character —
once in the background, then again in the foreground when the first run's
output had been swallowed by a pipe, and the container killed the second for
memory. Nothing was learned: the seam count was already written in three
documents, and `mk2_stamp.js check` had already proven the file was the one
those numbers came off.

**The instruction was real, and it was in this repo.** The corrected testing
rule was written at the top of `HANDOFF-MK2.md` on 2026-08-07 — and **three
copies of the instruction it replaced were left in place below it**: §3's "Run
all of these before you claim anything", §3's "The five-minute battery, before
any claim", and §9's "Before you start: the two-minute orientation", whose
first command was the seam battery. A reader who obeys the top of a 3,500-line
file arrives 2,400 lines later and obeys the bottom of it too.

**CLOSED.** All three deleted and replaced with the reasoning rather than the
verdict: *a battery is a DIFFERENCE instrument, so with nothing changed there
is no difference to find.* A new RULE ZERO — **on pickup, run nothing** — is at
the top of `START-PROMPT.md` (the pasted prompt) and `START-HERE.md`, with the
single exception named: `mk2_stamp.js check`, one second, and the only check
that can come back false before any work is done.

**The durable lesson, which is not about testing:** a correction placed at the
top of a document does not repeal the copies of the old rule further down it.
This repo has now made that mistake with the testing rule, and it is the same
shape as DERIVE-NEVER-LIST — **when you correct an instruction, grep for its
other copies and delete them in the same commit.**

### 0b.9 EVERY DOCUMENT SAID SEVEN GENRES; THERE ARE EIGHT
`MK2.genres()` returns **eight** — `dungeonsynth` is in the declaration, in the
published artifact, and composes (seed 1: 164 bars, 2033 events, C# minor at 66
bpm, its own chorus progression). Every document said seven, including the
sentences in `START-PROMPT.md` and `START-HERE.md` that describe the program.
**The DERIVE, NEVER LIST rule failing inside the sentence that states the
rule.** Fixed in both by replacing the count with the command that asks the
program. **Closing it fully** means a sweep for the remaining "seven genres" /
"all seven" phrasings in `HANDOFF-MK2.md` and the research docs, several of
which are load-bearing (a probe that iterates seven names would silently skip
dungeonsynth — not checked yet, and that is the thing worth checking next).

### 0b.7 THE HARNESS ITSELF — what 2026-08-07 says about it
Not a defect in the program; a defect in how it is checked.

- ~~**`mk2_test.js` cannot be run in parts.**~~ **DONE 2026-08-07.** A trailing
  non-numeric argument is now a name filter: `mk2_test.js kit` prints only the
  checks whose names contain it, and the summary names how many were skipped so
  a filtered run can never read as the whole battery. **It filters the answer,
  not the work** — the composition loops are shared and still run — so this is
  a legibility tool, not a speed one.
- **The two long browser checks are opt-in.** `mk2_ui.js` runs a fast core by
  default; `--full` adds the graph-growth check (which has to play for a fixed
  stretch) and the declared-vs-drawn sweep (every machine into every rack, then
  every kit). Both are named in the summary when skipped.
- **`mk2_snapshot check` samples.** It compares 25 seeds a genre against those
  same seeds' recorded lines, matched by (seed, genre) rather than by position;
  `--full` does the whole baseline, and `write` is unchanged because a baseline
  that is not complete is not a baseline. What a sample cannot see is the rare
  interaction — this repo has "7 of 2100" and "19 of 2100" in its history — so
  a change that could be that shape gets `--full`.
- **The snapshot baseline is regenerated on every commit**, so it can only ever
  catch change you did not intend, and only if you diff before overwriting.
  Diffing per genre before rewriting it is a discipline, not a tool. **Closing
  it** means keeping a per-genre hash line in the repo that must be edited by
  hand to change.
- **Sixty probe files, most written for one bug that is long fixed.** They are
  documentation now and are useful as that. They should not be mistaken for a
  suite that gets run.
- **Nothing in the battery answers.** The user is the only end-to-end test.
  This is §0's warning wearing different clothes.

---

## 0e. A SEND CAN ONLY BE PLAYED IN ONE DIRECTION — found and fixed `2026-08-10a`

The owner, on the build before this one: *"Your not doing anything with the fx.
Your not building sweeping motions quick nor long movement."* Two separate
faults, and the second one was invisible to the whole harness.

**Fault one: every gesture was written on a trigger that fires once.** `peak` and
`build` both key off the single apex section, so a gesture on either happens ONCE
in an eleven-minute record. `fill` recurs **9.8 times a song** and nothing used
it. Meanwhile free LFOs swung the hat filter 7000 Hz a minute — motion without
direction, loud enough to bury anything directed. Fixed: `fill` gestures across
the desk, the delay and the filters; free-LFO depths cut; the arc reshaped so it
climbs 0.30 → 0.89 instead of sitting at 0.13 for four minutes; the plan phases
shortened so the record is ~9 minutes rather than 11.5.

**Fault two, and this is the one worth inheriting: A CROSSING IN THE SEND MATRIX
IS A SWITCH BEFORE IT IS A KNOB.** `applyRack` translates routing-list membership
into **0 or 1**, and motion is an **additive offset** clamped to the dial. So:

> **A routed send is already at the top of its dial. Every positive move written
> on one is nothing at all. A routed send can only be played DOWNWARD — it rests
> partly closed and OPENS to full at the arrival. An unrouted one is the mirror.**

Nine lanes across four genres were pointed the wrong way, travelling as little as
**0.00% of their dial in every song ever made**, including one whose own comment
three lines above said *"a route tops out at the wire, so every move here is a
CUT"* while the lane beside it pushed up. Fixed in prog-techno (5), jungle (2),
plastikman (2), synthwave (1) and dungeon synth (1); one jungle lane that snapped
a crossing the genre does not route was deleted outright.

**And the generated one, which is why this is a mechanism and not nine typos.**
`makeMotion` synthesises `matrix.<bus>Room` from `G.stage.by[fn].depth` for every
genre that declares a stage. Depth is only ever meaningful *relatively*, so the
generator now slides the whole set onto the dial — the extreme section lands
exactly on the wire, the rest are pulled back from it — with which end decided by
`routeBaseFor`. Same spacing, same ordering, same draws in the same order.

**THE REASON NOTHING CAUGHT THIS, and the lesson for the next check:**
- the range check tested `clamp(x)` against the range the clamp enforces, so it
  could never fail;
- the swing check measured `motionAt`, which is the **offset**, not what the
  voice reads;
- `probe_automation`'s TRAVEL column measures the offset too.

**Every one of them was green on a send nailed open for eleven minutes.** The new
check — *"the clamp does not eat a crossing's movement"* — measures
`clamp(base + offset)` and fails a matrix lane that keeps under a quarter of the
swing written on it. Floor across the file is now 36%.

**AND THE ONE THE STEM PROBE FOUND AFTER THE BUILD SHIPPED.** `probe_stems`
measures the first 70 seconds, which is the window the owner's complaint is
about. In prog-techno's, the **ostinato — the seven-note figure that is the whole
genre — is barely there**: MISSED(A) **0.86 dB** against plastikman's **3.57 dB**,
on 42 notes against 105. The drums are the opposite, 6.39 dB against 1.85. So the
opening minute is drums and almost nothing else, where the genre it is
benchmarked against has its sequence running.

The cause is not the FX and not the material — seed 1's roll has the ostinato
playing from bar one of material A. It is the arrangement gate:
`form.build.enter.ostinato = [0.11, 0.07]`, so the figure arrives **11–18% in,
which on a 538-second record is 59 to 97 seconds**. *"The song takes so long to
get into anything"* is that number. **Not changed** — it is a deliberate
alap-shaped opening and pulling the entry forward is a taste call the owner
should make, not a fault to fix quietly in a published build.

**AND A FALSE ALARM WORTH RECORDING, because the next session will see it too.**
The same table shows prog-techno's bass at RMS −22.8 / A-weighted −44.1, and
removing it moves the mix 0.05 dB — which reads exactly like the probe's own
named defect, *"eating the headroom of a record it cannot be heard in"*.
It is not. Plastikman's bass is −25.8 / −46.0 with MISSED(A) **0.01 dB**: quieter
on both scales and contributing a fifth as much. A-weighting discounts 50 Hz by
about 30 dB by construction, so **every bass in this file shows a ~20 dB
RMS-to-A gap**. The column is only meaningful compared against another genre,
never read alone.

**Still open here:**
- **Nineteen lanes are automated but too small to hear** — dungeon synth's ten
  drum-tune lanes swing 0.24% of their dial (three cents), and five `panHz` lanes
  under 0.6%. Different fault from the rail: not clamped, just tiny.
  `probe_automation` calls this OVERDRIVEN and nothing fails on it.
- **The snapshot does not hash the motion plan.** Every FX change in this build
  left 2400 of 2700 songs byte-identical *by construction* — the gate cannot see
  the automation at all. The two probes above are the only coverage.

---

## 1. DEFECTS AND GAPS FOUND BY MEASUREMENT

| what | why it is open | what closes it |
|---|---|---|
| **No check knows WHICH ROOM ran** | The FDN silently fell back to the convolver for a whole build and every probe still passed: a convolver is repeatable, and its IR length *is* its decay. `soundState().room` reports it for the LIVE graph only. | A render-side assertion — the room should be able to state which engine produced a buffer. |
| **Random Hall makes ringing WORSE** | Measured 25.3 → 31.3 dB peak-to-median on a time-averaged tail. Ships OFF (`space.random: 0` everywhere). | Either a better implementation (the unverified diagnosis: per-line decay gain is computed for the NOMINAL length, so a wandering tap detunes the network) or a better metric. Distrust the current metric until it disagrees with a fixed network in Lexicon's direction. |
| **⚠ THE COUNT IN THE ROW BELOW IS STALE: it is 18, not 15, and the shape changed** | Re-measured `2026-08-05e`: **313 passed, 18 failed**, and the SAME 18 checks on the commit before it (`13fecdc`, rendered in a separate worktree with the same seeds) — so none of them belong to the arrival rule. The one numeric difference in the whole list is `fill->chorus: reverb return present` reading side/mid 0.1998 against 0.1980, which is that excerpt's own notes having moved. **The shape is no longer the one described below**: 11 are `"reverb return present, at depth"`, **4 are `"presence above 2 kHz exists (band rig)"`**, 2 are `"both channels carry the mix"` and 1 is `"solo tape: reaches the reverb"`. The old row's peak-ordering failure is gone and the presence and tape ones are new. | **The drift happened somewhere in `04a`…`05d` and has NOT been attributed to a build** — saying which would be a guess, and the honest step is a bisect over those builds by whoever next touches the mix. `04i` (lofi's tune moved from a sawtooth to an electric piano) is the obvious first suspect for the `presence above 2 kHz` rows and is a suspect, not a finding. |
| **13 of them are ONE STALE CHECK** *(the diagnosis below still holds for the reverb-return rows)* | Re-measured 2026-08-03o: **316 passed, 15 failed**, and the same 15 to the last digit on the commit before it, so none of them belong to the barberpole. **13 are `"reverb return present, at depth"`** — side/mid above its ceiling (0.16–0.28 against 0.16). That ceiling is `max(0.16, wet) + gate allowance` and it was calibrated when **the reverb was the only thing in the program making side energy**. The stereo stage now pans the players, so a correct mix fails a check that predates it. The other two: `"the section marked peak is the loudest"` on seed 2 (−14.50 vs −13.99, half a dB) and `"both channels carry the mix"` (L/R +1.6 dB on two choruses — a stage that leans). | Re-derive the side/mid ceiling from what is actually panned rather than from `wet` alone. **Do not just raise the number**: the check's whole value is that it fails when the return disappears, and a ceiling chosen to make today's mix pass proves nothing. The earlier note in this row (8 failures, sub-runaway, kit-free prechorus) described a battery that has since changed shape; the numbers above replace it. |
| **The gated reverb is still a ConvolverNode** | Which is why genres with a gate sit at the ~-100 dB float floor instead of bit-exact. | Either move it into the room worklet or accept and document permanently. |
| **Section-keyed mix moves automating buses that are SILENT in that section** | Found 2026-08-03 preparing the taste check, measured with `harness/probe_section_motion.js` (drive the control end-to-end inside the very section its move is keyed to; the difference signal is what it could possibly change there). **lofi's "Tubby pair"** — `matrix.leadMix`/`leadEcho` at the outro, the "record ends by receding" move — is keyed to a section whose role list (`["keys","bass"]`) has never included the lead: **-95.8 dB** of possible change in the outro against **-5.6 dB** in a chorus. Its intro half acts on a single leaked pickup note. **jungle's bridge drum-drop** — `drumsMix` cut + `drumsEcho` rise, the engineer's dub move — is keyed to a bridge whose roles are `["bass","keys"]`: **-90.5 dB** there, **-6.4 dB** in a chorus. The arrangement removes the drums before the mixer's hand arrives, so the kit mutes instead of washing away into the echo. The comments describe the arrangement the writer imagined, not the one the roles table produces — and nothing compared the two (the polymeter shape, again). Role tables alone cannot adjudicate: plastikman's bridge plays only the ostinato and its keys bus is LIVE there at **-3 dB** (the ostinato rides the keys bus in that rig), so its `keysMix` bridge cut is real — while its bass bus reads **-88.9 dB** in the same bars, so its `bassEcho` bridge dip is not. | Per move, a decision on the record: either re-key the move to a section where its bus sounds, or put the role INTO the section so the mixer's move has something to act on (jungle's own research wants the second: the drums leaving *into the echo* needs drums written in the bridge and removed by the FADER, not by the arrangement). Both change what songs play → research the shape first, re-baseline deliberately, and let the user's a verdict on it rule (the taste check in the backlog already asks the lofi-ending and jungle-drop questions). A seam check comparing every section-keyed move against what its bus carries there would close the class; `probe_section_motion.js` is the measuring arm. |
| **`intro` bars = 4 undercount** | The target-length arithmetic treats a cold open as 0 bars and a normal intro as 4, which is not what the form actually produces. | Its own measured commit. |
| ~~**The program stutters, worst on acid and synthwave**~~ **FIXED `2026-08-05g`** | The user reported it; measured, the report was exact — synthwave ran at a p50 frame of 41 ms (24 fps) and acid 28 ms against lofi's 18. `knobEl`'s per-frame refresh wrote `val.textContent` for every one of ~169 knobs whether or not the value had changed; a text change dirties layout, and the layout was costly because the roll holds one element per note. Four other theories were measured and refuted first — see `harness/probe_stutter.js`. | CLOSED: write only what changed. **Every genre now sits at 17 ms (60 fps); acid 43 long tasks → 0, plastikman 6 → 0, synthwave 100 → 4.** STILL OPEN: synthwave keeps 4 long tasks a run, worst 155 ms, not yet attributed. |
| ~~**THE AUDIO GRAPH GROWS FOR THE WHOLE SONG AND IS NEVER FREED**~~ **FIXED `2026-08-06a`** | The user, 2026-08-05, corrected me twice and was right both times: *"it is a runaway fx ... that gets so large it bogs the program down to stuttering"*, and then *"Im not turning any knobs, it happens on its own."* MEASURED with `harness/probe_nodes.js` (new), acid, nobody touching anything: **825 connected audio nodes at 15 s, 3073 at 60 s, 6923 at 120 s, 10 975 at 180 s** — about sixty a second, in a straight line, never released. An acid record runs 6.3 minutes, so it ends with roughly **23 000 live nodes**, every one processed on every render block. lofi leaks at the same rate (3963 by 60 s) and is only spared because its record is 2¼ minutes long — which is exactly why the two genres the user named are the two longest and densest. **The LEVEL never runs away** (the same record measured flat at −10 to −12 dB rms for its whole length), so it is not a feedback loop; the graph itself gets too big for the audio thread. **Nothing in this repo could see it**: `probe_mainthread` reads a steady 17 ms throughout because this is the AUDIO thread, the level meter reads flat, and the seam checks and snapshot never build a graph at all. | `dispatch` sets `onended` on the nodes a voice RETURNS, which are its sources only (`V` is documented as returning "array of source nodes"). Everything the voice built downstream — Gain 2320, BiquadFilter 714, StereoPanner 316 in one lofi minute — stays connected to the bus with nothing to end it. The fix is a central teardown: record every node created during the `voice()` call and disconnect the whole chain once ALL of that note's sources have ended (several voices return more than one source, so a first-one-wins teardown would cut the others). **CLOSED.** `dispatch` records every node created while a voice is building and disconnects the lot once ALL of that note's sources have ended (several voices return more than one; a first-one-wins teardown would cut the others off mid-note). Two belts: it records only during the `voice()` call, and anything reachable from the graph object (`graph.__own`, set by `buildGraph`) is skipped. **MEASURED on the user's own seed — synthwave 10855: nodes still connected went 30 543 → ~1 200 over the same run, and STOP + NEW SONG now resets to 279 where it used to leave 30 387.** Verified for SOUND and not just for the count, which is the trap the reverted stop-fix fell into: probe_voices 0 threw / 0 silent, mk2_ui 34/34 including "pressing play makes a sound", renders repeatable on all seven, snapshot IDENTICAL, and **the rendered-audio battery the same 313/18 with the same 18 checks — no new failure and none accidentally fixed.** Guarded by a new mk2_ui check, driven to failure both ways: 10.9% of created nodes still connected with the fix, 68.8% without. |
| **STOP DOES NOT STOP THE EFFECTS, and with the FX open the limiter is fed +21 dB** — the user's own report, 2026-08-05: *"when it happens i hit stop and i hear an echo continue"* | `stopLive()` stops the note SOURCES and nothing else — it is four lines and none of them touch the delay line, the feedback gain or the sends. The live graph is built ONCE per audio context and reused for every song, so the residue outlives the stop, the next song and a change of genre (the meter beside `stopLive` was added for this very report and says so). MEASURED with every echo/flange/dp4/barber/matrix knob dragged to its top by hand — the state a user exploring the rack arrives at: the tail was still at **−32 dB twelve seconds after stop** and had only reached −79 dB at thirty. In the same state the level arriving at the limiter reached **rms +4.6 dB, peak +21.1 dB** — effect returns land on `post`, PAST the master soft-clipper (deliberately, and documented at `matrixDest`), so only the limiter catches them and it is being fed 21 dB of overshoot. A limiter driven that hard pumps, and pumping is what "stuttering" sounds like. **Neither number is reproduced on a song nobody has touched**: acid played flat at −12 dB rms for two minutes and fell to −91 dB two seconds after stop. | Drain the effects on stop. **AND THE OBVIOUS FIX IS WRONG — it was built, measured and reverted on 2026-08-05g:** ramping `echoSend`/`echoFb`/`send` and every `route` gain to zero on stop leaves SCHEDULED AUTOMATION on those params, and `setSpace` restores them by assigning `.value`, which an AudioParam **ignores once it has an automation timeline**. Playback went completely silent (−inf on every cycle) and stayed silent. Whoever picks this up: the tail check is not sufficient — **measure that it still makes a sound while PLAYING**, which is the check that caught this one. The right shape is probably a dedicated mute node in the master chain that nothing else automates, rather than reaching into params the bus rider owns. |
| **MIDI wall-clock flake** | `mk2_midi` fails "no tick drifts" under load; always green on rerun. Documented, never ignored. | Nothing, unless it starts failing when idle. |

## 2. METHODOLOGY — how this project measures

- **A render A/B without a same-build control measures its own noise.**
  Two separate mistakes this session were caught only by running that
  control. Past handoff entries argued from render A/Bs with no control;
  they are not thereby wrong, but they are unverified in that respect.
- **Anything that LISTS what the program contains will go stale.** Three
  times in one session: the seam scanner's read-detection, the probe's
  column names (twice). Derive it from the declaration instead.
- **TWO IDENTICAL NUMBERS ACROSS A REAL CHANGE ARE NOT A NULL RESULT, THEY
  ARE A BROKEN MEASUREMENT.** `2026-08-04l`: a before/after on jungle's bass
  read byte-identical on two builds whose ROLL had plainly changed. The cause
  was the argument order — `composeSong(seed, RIG, genre)`, and "jungle" is
  both a genre and a rig, so `composeSong(s,"jungle")` composed **lofi** on
  the jungle rig, twice. The roll already guarded this at its own front door;
  `makeChart` now throws on the ambiguous form too. **A null result that is
  too clean to be true is the measurement confessing.**
- **Run `probe_wiring` after adding anything.** A capability one genre uses
  is a capability that has not been understood yet.

## 3. THINGS BUILT BUT BARELY CONNECTED

Measured by `probe_wiring`, 2026-08-03:

- ~~**flanger, DP/4, snap — one genre each**~~ **DONE `2026-08-04q`** — and
  **the "one genre each" figure was partly a probe artifact.** `probe_wiring`
  decided a column was reached by checking its declared BASE, so synthwave's
  flanger — `leadFlange`/`echoFlange` ridden from a zero base, shut in the
  verse and opened through the chorus — was invisible to it for two builds.
  The probe counts motion-reached columns now and marks them `rid`, so the two
  ways of arriving stay distinguishable. **Flange 1 → 3, DP/4 1 → 2, cuts
  1 → 2.** Jungle took all three on its own sources: "flanger and phaser
  effects were used on Amen breaks" and a rack of Alesis/Zoom/Boss multi-FX
  [corpus:dogsonacid], and its form research is a DJ architecture whose drop is
  a rectangle, which is what `snap` is. **`probe_matrix` caught a
  knob-that-does-nothing on the way**: the DP/4's four unit RETURNS default to
  0, so feeding it is not enough — jungle opens PHASE and CRUSH, both named by
  its sources, and leaves DRIVE and ROTARY shut.
- **The barberpole is on two** (synthwave, plastikman) — better than one and
  still thin. `barberpole.md` §6 gives the test for a third: the DAFx paper
  only claims the illusion works "at slow modulation speeds and for input
  signals with a rich frequency spectrum", so it belongs on a genre with a
  sustained wash, not on a sparse one.
- **acid and jungle have no panning at all** — their draws land on machines
  with no `pan` control. Either give those machines the stereo stage or
  accept it as their character, in writing.
- **`stage` on two genres** (lofi, synthwave). Five to go, and it is the
  cheapest way to make the field mean something on every record.

## 4. GENRE WORK NAMED AND NOT DONE

- **Form plans for dkc, acid, plastikman.** Four genres have one; these
  three still walk planlessly. Plastikman has the strongest sources
  (Hawtin's "year of subtraction"; *Consumed*'s single-take arc).
- **The `snap` for jungle and synthwave** — see §3.
- **One coincidental dkc↔bladerunner twin** in probe_form; expected to
  vanish when those genres get plans.
- **Pickups realise 8.2% against the corpus's 26%** — `fits()` blocks some;
  a taste dial, [CHOSEN].

## 5. SOUND WORK NAMED AND NOT DONE

- **The other two Hawtin units are UNRESEARCHED**: Roland SRV-330
  "Dimensional Space" and the ART Multiverb (gated reverb on claps — we
  have a gated verb, never compared). See `fx-units.md`, which says
  plainly not to build from the guesses written there.
- **Three things the barberpole's sources describe and we did not build**,
  listed with their reasons in `barberpole.md` §5: Whirl's **stereo phase
  offset between channels** (ours offsets between NOTCHES — this is the one
  worth doing, now that the program is stereo), its **through-zero direction
  change** (inert here: direction is per song, so nothing changes
  mid-sweep), and its **negative feedback** (a feedback path around the
  cascade closes a cycle, and a cycle has already been measured to cost the
  renderer its repeatability).
- **Cross-modulation for plastikman.** *Consumed* is "an album of feedback,
  everything cross-modulating everything else". The grid cannot do it —
  a cycle costs repeatability — so it belongs inside worklet arithmetic.
- **A matrix-fed room (FDN with an orthogonal feedback matrix)** — stability
  becomes structural rather than swept. Design in `matrix-mixer.md` §7.
- **Stem columns** — the professional "mix of mixes" pattern; the program
  already renders stems.
- **Rubato.** No mechanism exists for free tempo inside a section; groove
  jitter is not it. Named in `bladerunner-form.md`.
- **Harmony and chromaticism**, including two-chord stasis. Named in the
  same place.
- **The sax is PARKED.** Terms for un-parking are in the handoff's warning
  block: real multisamples or a waveguide, verdict-gated on one exposed note
  BEFORE any system is built around the tone.

### 5.0b THE SNAPSHOT BASELINE HAD BEEN STALE SINCE `08a`, AND NOBODY NOTICED

Found on `2026-08-08d` while proving the legato field moved no note. Bisected
by hashing old builds against the recorded file:

| build | songs matching `mk2_baseline.snap` |
|---|---|
| `07o` — the last build before the tape | **200 / 200** |
| `08c` — HEAD before this work | **18 / 200** |

**`08a` is where it went.** That build moved the tape drift off the note and
onto the master — "THE PER-VOICE WOW IS GONE; THE TAPE HAS IT" — which deleted
`wow` and `flutter` from **137 772 events**, and the baseline was never
rewritten. Proved exactly, not guessed: strip those two fields from `07o` and it
is **200/200 identical to `08c`**. So nothing else slipped through eight builds;
one honest change went unrecorded and left the tool crying CHANGED at everybody
who ran it afterwards.

**Rewritten at `08d`**, absorbing exactly two field changes with a receipt for
each: `08a`'s removal of `wow`/`flutter`, and `08d`'s addition of `holdSec`
(200/200 identical to `08c` once stripped). No note moved in pitch, time or
duration in either.

**The lesson is not "remember to re-baseline".** It is that a stale baseline is
INDISTINGUISHABLE from a regression at the moment you meet it, and the cost is
paid by whoever meets it — three runs of bisecting, here. A build that changes
what an event CARRIES must rewrite the file in the same commit and say what the
rewrite absorbs.

### 5.1 LEGATO — shipped `2026-08-08d`, and four things it does not do

`docs/genre-research/legato.md`. A button per part on the mixer strip: hold
each note until the next one on that part starts, capped at a bar, extend only.
Read at the one dispatcher, so a hand on it changes the record about a second
later and changes a bounce identically.

**The measurement that shaped it is worth keeping**: the CHORDS already overlap
on seven of the eight genres (lofi −1.37 s, bladerunner −1.81 s), so the switch
mostly does nothing there — and the parts that carry a LINE do not (bladerunner's
answer sits 19.6 s apart, dungeon synth's 17.2). The gap the user heard is real
and it is in the melodic parts.

Open, and each is a real limitation rather than a to-do written for the sake of it:

- ~~**It is OFF everywhere by default and no genre declares it.**~~ **CLOSED
  `2026-08-08e`**, on the user's direction ("wouldnt it make sense that genres
  get access to this"). A genre may declare `legato: { part: 1 }`; bladerunner
  holds both of the player's lines and synthwave its tune, each with a source
  (legato.md §7). The button became THREE-WAY — follow the genre / forced on /
  forced off — so the hand still outranks the table both directions.
- **A genre cannot vary it BY SECTION.** The user asked ("on on certain
  sections or for the whole song"); today the genre's declaration is
  whole-song and only a live hand covers sections. The mechanism it wants: the
  declaration reaching dispatch with a time span, the way motion already
  reaches bus controls per section. legato.md §7.
- **The roll does not show it.** The visualiser draws `perf.events`, which is
  what was composed; legato is what the player does with it. Defensible, and
  the first person to press the button and look at the roll will disagree.
  Now that two genres hold notes by default, this will be met sooner.
- **A phrase voice is untouched.** The sax renders a whole breath from its
  opening event and its members' durations live inside `ev.phrase`, which the
  dispatcher does not reach into. The sax is parked, so this cost nothing —
  it will cost something the day it is un-parked.
- **The bar cap is [CHOSEN], not sourced.** Nothing in the sources gives a number;
  it is the shortest cap that cannot shorten a real phrase. legato.md §3.

### 5.1b THE BASS UNIT'S ONE FACE + THE COMPRESSOR — shipped `2026-08-08f`

`docs/genre-research/bass-unit-face.md` and `bus-compressor.md`. What remains
open from those two builds, honestly:

- **The dimmed 303-circuit knobs are a compromise with a direction.** Sixteen
  controls draw dimmed over non-acid engines. Each one that LEARNS a generic
  meaning (the way accent/slide/muffler/tune/volume did) moves from dimmed to
  live — cutoff and decay are the obvious next two, but they collide with the
  engines' own prefixed filter knobs (two owners of one filter), so each needs
  a real design, not a sweep.
- **The compressor's four declarations are a sourced idiom, not a play.**
  One session with a verdict on it decides whether acid/plastikman/jungle/synthwave keep
  their glue and whether the thresholds sit right. The needle makes that
  session possible — that was the point of the needle. **`08h` moved the unit
  onto the desk's centre section, beside the master fader** (`panel.host:
  "mixer"`, `bus-compressor.md` §7), which makes that session easier and
  changes nothing about this row.
- **No genre rides the compressor's knobs** (all voicing+live, hand's
  territory). A genre pumping its release per section is a real technique and
  a real future, and it would need the kinds revisited.

### 5.1c THE SPRING TANK — shipped `2026-08-08g`, and what it waits for

`docs/genre-research/spring-reverb.md`. The unit, the matrix column, the kick
and the shaking springs are in. Open, honestly:

- **No genre feeds it.** Its ten crossings are voicing+live — the hand's —
  because no genre here is dub and a spring send with no source is taste. The
  sourced route (echo→spring, King Tubby's wiring) is OPEN and waiting. If a
  genre ever earns a spring — jungle is the nearest cousin — its cells flip
  to `bus`, it declares `springFeeds`, and the must-be-ridden check starts
  guarding them. One play decides.
- **The IR's numbers are half sourced.** The round-trip time (52 ms), chirp
  span and blur rate are [CHOSEN] within the sourced SHAPE (echo train, rising
  chirps, progressive blur). A play against a real tank recording would
  pin them.
- **The tank is mono on purpose** — one pickup. If it ever goes stereo it
  should be TWO TANKS, not one tank panned.

### 5.2 THE GENRE'S HANDS ON THE PART STRIPS — asked for, decided, not built

The user, `2026-08-08`: "We have a bunch of new controls wouldnt it make sense
that genres get access to this in order to effect change over the sections and
the whole of the song?" The audit of what a genre can and cannot reach:

| the strip's control | can a genre reach the same outcome? | verdict |
|---|---|---|
| fader | YES — `roleGain` is the genre's own level for the part | **no second door.** Two owners of one fader. |
| LOW/MID/HIGH (per part) | YES — through the loaded machine's own tone controls | **no second door**, same reason. **AND THE USER RULED ON IT DIRECTLY, `2026-08-08`: "We are not automating any of the low mid highs on the instruments [strips]."** So this row is CLOSED by decision, not left open. |
| REVERB/DELAY send (per part) | **NO — only the bus master.** Three strips share the keys bus, so a genre wanting the pad wet and the figure dry cannot say it | **STILL OPEN, and NARROWED at `08h` — the HAND can do it now, the GENRE still cannot.** A part's send knob is the send itself rather than a share of an invisible master, and turning one up opens that bus's master far enough for that one part while holding its bus-mates where they were: measured on lofi, the pad reaches the delay at 0.620 while `keys` and `ostinato` sit at 0.000 on the same bus. So the CAPABILITY exists in the graph and is proven; what is missing is a genre table key that reaches it. The sourced case is unchanged: "automating sends creating movement and tension" [corpus:trackscore]. Needs its own research pass and per-genre taste decisions — not to be wired in a hurry. `docs/genre-research/channel-sends.md` §7. |
| LEGATO | **was NO** | **CLOSED `08e`** — see §5.1 |
| master EQ (the desk) | YES — `desk.*` are `bus` controls genres already ride | already true; the knobs just moved onto the master strip |

## 6. MUSIC THEORY — the engine, what it has and what it lacks

*Added 2026-08-03 at the user's direction: "improving the music theory engine
… counterpoint, better wider chords … a list of music theory we are missing
and need and what we have that needs improving." Every line below was verified
against the code or measured this session — line numbers are `Deckards
Orchestrator MK2.html`. Research: `docs/genre-research/lofi-harmony.md`,
`docs/genre-research/counterpoint.md`. Measurement:
`harness/probe_counterpoint.js` (new), plus `probe_theory`, `probe_comp`,
`probe_harmony_neo` re-run at this commit.*

**The one-line summary: the vertical vocabulary stops at a seventh, the
horizontal vocabulary does not exist, and six of seven genres are locked
diatonic.**

> ### 6.0 THE FIVE FROM `static-harmony-and-evolution.md`, and where they stand
>
> Opened `2026-08-08` when the user asked what modal jazz teaches about a song
> evolving, and said minimal techno "is a failure … we fail to capture the slow
> evolving nature". Then: *"Work on the 5 things you mention … Do all 5, start
> with the first and work your way down."*
>
> 1. **The mode never changes inside a song** — **DONE `2026-08-08n`.** A genre
>    may declare `keyShift`; minimal techno and dungeon synth do. Sourced to
>    Milestones (+2, mode changes) and So What (+1, mode held), which are the
>    two settings the dial has. 57% of minimal techno records move, 15.6% of
>    all bars — 27% of the bars of a record that moves, against So What's 25%.
>    **Unheard.** `docs/genre-research/key-shift.md`.
> 2. **No part answers another part** — **PARTLY DONE `2026-08-08o`,** and the
>    claim above was too strong: the TUNE already asks and answers itself
>    (`phrase(0,…)` then `phrase(2,…)`, commented "the answer: contrary,
>    resolving"). What was absent is one part answering ANOTHER, which every
>    source calls the primary case. `counter: { style: "answer" }` moves the
>    second voice's notes as a PHRASE into the tune's silence, keeping the
>    call's shape; dungeon synth declares it, sourced to medieval antiphony.
>    Notes in the tune's silence 38% → 68%, 1.9 notes an answer instead of 1.0,
>    at the same total density. **Still open:** the four genres in this device's
>    own lineage (lofi, jungle, acid, plastikman) have no second voice at all,
>    each by a researched decision, so nothing answers there; no source was
>    found for it in the game-music genres; the answer does not yet resolve onto
>    a chord tone; and it fires in 7% of bars.
>    **Unheard.** `docs/genre-research/call-and-response.md`.
> 3. **No phase relationship between two patterns** — **DONE `2026-08-08p`, and
>    the claim above was substantially WRONG.** Measured: 58–96% of lfo pairs in
>    six of eight genres already never re-align inside a record. What was
>    missing was the PAIRING — zero destinations anywhere carried two lanes at
>    nearly the same rate. A `phasing` twin (same shape, same depth, same
>    starting phase, a few percent slower) now beats against its parent: proved
>    at 0.27 → 0.023 → returning across one record against a flat 0.15 control.
>    **The arithmetic then removed two of my five choices**: Blade Runner and
>    dungeon synth have movements as long as their records, so a pair traverses
>    a tenth of its beat and stops. Kept on minimal techno (sourced), acid and
>    jungle (**judgement calls on a staleness measurement, not a source —
>    the user's to overrule**). **Unheard.** `docs/genre-research/phasing.md`.
> 4. **`bassStyle` is one string per genre, forever** — **DONE `2026-08-08q`,
>    and the gap was NOT the fault.** `bassRoles` is now a weighted list drawn
>    per material, guarded so a genre cannot be handed a role whose table it
>    lacks. Declaring minimal techno `[["acid",5],["drone",3]]` made it WORSE
>    (root 79.2% → 80.8%) — a second way to pedal is not a cure for a bass that
>    pedals because it cannot do anything else. **The trash bassline was three
>    numbers in one table**, two of them marked `[CHOSEN]` and set by me:
>    `distinctPitches [2,2]→[3,2]`, `rootShare 0.62→0.45`, degreePool root
>    58%→43%. Result: **root 79.2% → 62.2%, repeats 62.5% → 40.2%, distinct a
>    bar 1.70 → 2.27**, still sparser than acid house. `bassRoles` currently has
>    **no user** and that is stated rather than hidden. **Unheard.**
>    `docs/genre-research/bass-roles.md`.
> 5. **The older §6 rows below** — open, and unchanged by any of the above.
>
> ### AND WHAT THE 2026-08-08 RUN LEFT OPEN, in the owner's priority order
>
> **A. THE DRUM SECTIONAL ARC — ~~the largest open item in the file~~ BUILT
> `2026-08-09a`, AND UNHEARD.** A record had 6 to 14 sections with drums and
> three or four drum parts; synthwave played one of its four in 6.5 sections of
> the same song, jungle never gained or lost a drum in any section of any
> record, and four genres closed on a drum part already heard in 100% of songs.
> A section's drums are now the genre's kit plus a ladder of MOVES drawn once a
> record, the rung set two thirds by position and one third by the section's own
> energy — "pile up, with dips", the owner's choice — and the closing section
> takes the top of the ladder with a draw deciding whether it fills up or empties
> out. Closing drums are now new in 100% of songs in every genre with drums; all
> seven moved, 25 of 25 seeds. `docs/genre-research/drum-sectional-arc.md`,
> `harness/probe_drumarc.js`, brief in the backlog. **What is left of it
> is below as A1–A3, and none of it is the mechanism.**
>
> **A1. THE STEP GRID SHOWS THE PATTERN, NOT THE SECTION.** The drum machine's
> sixteen steps draw pattern A/B/C; a section carrying arc moves plays a private
> copy of one. So the lit step is the right step of the right bar while the hits
> under it are the pattern's own. The playhead is honest about WHERE the song is
> and not about WHAT it is playing there. **What would close it:** the grid
> showing the section's own copy — which means deciding what pinning a step means
> when the thing on screen is one section's copy rather than the pattern every
> section shares. That is a design question, not a bug fix. Found by `mk2_ui`
> going red on "the playhead lights a step, 0 lit"; the underlying table was
> already missing `Bvar` and the lifted pair before the arc existed, so the
> playhead has been dark in a chorus variant for as long as one has existed. That
> half is fixed and has a seam check.
>
> **A2. TOMS IN ACID HOUSE AND MINIMAL TECHNO — refused, and the owner asked for
> them.** They said "heavy use of TOMS"; both genres were given a tom move and
> the battery caught acid crossing a ceiling that exists so a near-tomless genre
> cannot grow a drummer. Minimal techno's refusal was already in the file and
> sourced. Toms rose where the kits declare them (lofi 14.7% → 22.8% of drum
> parts, synthwave 32.3% → 40.9%, vgm 26.3% → 29.8%) and fell where they do not.
> **What would close it:** the owner's judgement, or a source. It is one weighted line
> per genre to put back.
>
> ### H. THE GENRE FADERS ARE BLIND, AND THEY NEGATE — opened 2026-08-09, IN PROGRESS
>
> The owner: *"I think the genre faders are our chief rule breaking tool. But
> they are quite blind and limited. It seems to bake in certain aspect negating
> others."* Both halves measured; `docs/genre-research/breaking-the-rule.md` §7.
>
> **BLIND.** A 50/50 fader is honest ACROSS songs and a lottery INSIDE one. Over
> 30 seeds a pair the split averages ~47/53, and individual records run from
> **10/90 to 50/50** (vgm+jungle worst at 10/90, lofi+jungle 11/89). The control
> describes a distribution; the person playing it hears one draw from it.
>
> **NEGATING.** When the kit group goes to jungle the other genre's whole drum
> identity is gone — the group draw being winner-takes-all, which is the same
> cause as "blind". *(An earlier claim that one switch discarded fifteen drawn
> fields was WRONG and is struck through in the research sheet: `chop` is grouped
> WITH the kit. The real residue was two ungrouped tom paths, fixed at `b7950cf`.)*
>
> **⚠ THE THREE SENTENCES BELOW ARE EXAMPLES, NOT A CHECKLIST. Corrected by the
> owner, 2026-08-09:** *"My EXAMPLES were meant to convey the idea NOT exact
> things to do."* This section used to say "what would close it: the owner's own
> three sentences" — three acceptance tests built out of three illustrations,
> with the remaining steps organised around delivering each one literally.
> **THE IDEA is the thing to build to:** the faders are *"our chief rule breaking
> tool"*, and a rule-breaking tool lets you take a named part of one genre and
> put it with a named part of another, on purpose — any part, any genre, because
> you asked for it. The rows below are useful as a picture of what that feels
> like from outside. Delivering exactly those three would not close this.
>
> **THREE THINGS THE OWNER USED AS EXAMPLES, and where each stands:**
>
> | | today |
> |---|---|
> | dungeon synth harmony **at lofi length** | impossible — length is bundled with form (9.9 min vs 2.3) |
> | **amen break + minimal techno's sends + a lofi track** | arrives **4 times in 60 songs (7%)** by chance, cannot be asked for |
> | **a DS core with lofi drums on the DS drums** | impossible — `drums2` appears **0 times** in the file |
>
> **⚠ STEP 2 IS BUILT — `2026-08-09c`. Do not start it again.** The elements are
> DEALT now, not drawn one at a time: a shuffled order, each element to whichever
> genre is furthest behind its fader's share, forced elements counted first so
> they cost what they are worth. **Worst single record across 28 pairs went from
> 8/92 to 45/55; each pair's worst record from 31 points off half to 2**, and the
> two are arithmetic — an odd number of elements will not divide in two. `deal
> again` on the blend panel rerolls the hand without moving the shares, and the
> panel now says what the record actually came out as. The gate held: 200 songs
> IDENTICAL, and structurally so — a solo genre returns before the allocator
> exists. Numbers, method and the three defects the new tool found:
> `docs/genre-research/breaking-the-rule.md` §8.
>
> **What is left of §H is steps 3–6**, below, and none of them is the quota.
>
> **SIX STEPS, approved. Step 1 is done at `b7950cf`:** `blendElements()` derives
> the 17 elements a genre is made of, `BLEND_NAME` gives them words, a seam check
> walks the set (it caught `space.duck` unnamed within a minute), and the two
> stray tom paths joined their kit.
>
> ~~**Step 2 is where the next session starts: the quota allocator**~~ **DONE
> `2026-08-09c`**, with the gate held. Three things it turned up on the way, all
> written up in the research sheet §8 and all now fixed:
> **(a)** the second voice's style and the steps it moves by were drawn
> separately and came from different genres in **73 of 120 songs**, while
> `BLEND_NAME` claimed they travelled together — the ostinato/registers and
> tom-path shape for the third time;
> **(b)** the genre's own `label` was dealt a share and then overwritten, which
> put a seventh element on one side of a twelve-element hand in 14 songs of 30;
> **(c)** *"all five send lists are one decision"* was never true of the code —
> here the code was right and the **words** were wrong, so the four are named
> rather than hidden, which they had to be once the panel started printing them.
>
> **⚠ STEP 3 IS BUILT TOO — `2026-08-09d`. Do not start it again.** Every element
> the blend decides now has a control on the panel: *whichever*, or *always
> <genre>*. **594 element-and-genre combinations across all 28 pairs, every one
> honoured.** A pin is settled before the dealing, like an element only one genre
> declares, and the quota works around it — with one element pinned the rest of
> the record is still within half an element of the fader's share, over 84 songs.
> A pin OUTRANKS the fader on purpose; the sliders decide what was not pinned. A
> pin that cannot be honoured is refused in words. `mk2_roll.js --trait kit=jungle
> --deal 2` prints an aimed blend, because a feature the roll cannot print is one
> nobody has read the notes of.
>
> **⚠ AND SONG LENGTH IS NOW A DIAL, NOT A BLEND ELEMENT — `2026-08-09e`.**
> Step 4 asked for `form` to be split so length could be blended. It is answered
> better than that: length is a **control on the transport**, 1:00 to 20:00, on
> every genre. The owner: *"i cant make music this app is meant to do the stuff i
> cant do. But i want to be able to do things and set things."* A thing you set
> beats a thing you blend toward.
>
> **The first example on the list is therefore live:** dungeon synth harmony at
> lofi length is `--genre dungeonsynth --len 2:20`, with its intro, verses,
> chorus, peak and outro intact.
>
> **AND IT EXPOSED A PRINCIPLE-1 VIOLATION THAT HAD BEEN THERE ALL ALONG.**
> `form.lengths` is one hardcoded number per function — `verse: 16` — so the
> shortest dungeon synth record was about seven minutes, and the first version of
> this work **wrote that down as a floor** as though it were a fact about the
> music. *"Bullshit! A song can be any length if weve coded it to be so ridged
> its fixed to one length weve done something very wrong!"* Section length is a
> constraint now. Shortest record per genre: dungeon synth 6:45 → **1:42**,
> jungle 4:48 → **1:08**, bladerunner 3:32 → **1:26**, acid 3:09 → **0:47**. A
> seam check fails if any genre's floor climbs back over two minutes.
>
> **What is still open of step 4:** whether length should ALSO be a blend element
> — "70% of dungeon synth's length" — is now a genuinely open design question
> rather than the only way to get at it, and it is not obviously worth building.
> Ask before doing it.
>
> Left to do: ~~3 pin an element to a genre~~ **done**,
> 4 split `form` so song length is its own element, 5 per-genre switches under
> each fader, 6 `drums2` on the `keys2` pattern — the only new machinery.
>
> **What would close it:** a fader that can be ASKED, not just relied on — any
> element of any genre in the blend put where the hand wants it, and the shares
> holding around whatever is pinned. The three examples above are a good way to
> check the result by hand; they are not the definition of done.

> ### G. THE PROGRAM HAS NO WAY TO BREAK ITS OWN RULES — opened 2026-08-09
>
> The owner: *"Art breaks rules thats how new things are made… otherwise no new
> genre would ever be invented."* Measured: acid house is **0.0% in every column**
> of `probe_theory` — not one note outside the key, not one dissonance left
> hanging, in twenty songs. Synthwave and jungle never leave the key either. One
> genre of eight can reach a chromatic chord; one can reach a chromatic bass;
> `coltraneCycle` is written, correct and **unreachable by any genre**.
>
> **And the structural finding: there is no mechanism anywhere that breaks a law
> on purpose.** Every out-of-key note is one the rulebook already permits. Two
> research sheets exist on the subject and both make the rulebook BIGGER, not
> breakable. The program has hard laws and soft laws and no third thing.
>
> Researched, with every page fetched, in
> `docs/genre-research/breaking-the-rule.md`. The four design questions were put
> to the owner and they answered all four with "Research" — so that sheet decides
> them rather than handing them back. In short: a break lands **after the rule
> has been taught** (expectations are learned by repetition, so a violation the
> player cannot measure is not a violation); it **stays broken and the record
> adopts it, once** (both the TB-303 and jungle's timestretch are a documented
> FAULT kept and repeated until it was the genre); the laws it may break are **the
> genre's own habits first**, the key second, dissonance third, and **the rule of
> three not at all** — that is the law that teaches the expectation everything
> else depends on. **What would close it:** the owner's answer to the one question
> the research could not settle (see the sheet §5), then a mechanism where the law
> becomes a cost paid on purpose — which principle 2 already requires.
>
> **A4. A DRUM MACHINE LOADED INTO BLADE RUNNER MAY PLAY SILENCE — NOT
> MEASURED, FLAGGED.** Blade Runner composes 7.9 drum notes a song into its
> material and emits **0.0 drum events**, because `drums` is active in **0 of 594
> sections** over 60 songs. That is correct for the genre — there is no kit in
> that score. But the arrangement's rule that lets a HAND-LOADED machine join any
> section covers `keys2` and `lead` only; `drums` is not in that list. So loading
> a drum machine into this genre's rack looks like it would compose a part and
> play nothing — **the exact defect already logged for the saxophone** ("load a
> saxophone, hear silence"). **This is a reading of the code and NOT a
> measurement**, which is why it is filed rather than claimed. **What would close
> it:** compose a Blade Runner song with a drum machine loaded by hand and count
> the drum events. If it is zero, the fix is the one the sax got.
>
> **A5. THE SOURCE AUDIT — two quotations in the drum research were not on the
> pages they were credited to.** Found 2026-08-09 when the owner asked whether
> the web work was real. Both came from search-result summaries rather than from
> a fetched page. Every source in that sheet has now been fetched and checked
> word for word; the audit table is `drum-sectional-arc.md` §7, the false quotes
> are deleted, and one design decision (the open-hat rung) lost its source and is
> now marked `[CHOSEN]` in the genre tables. **The general risk is not closed:**
> other research sheets in this repo were written the same way and have not been
> audited. **What would close it:** the same fetch-and-check pass over the sheets
> whose claims are load-bearing.
>
> **A3. BREAKBEATS IN OTHER GENRES — parked by the owner**, deliberately, to hear
> the arc first. The break chopper is already a loadable machine with its own
> controls; only jungle's table reaches it. Jungle's own chopping now varies by
> section, which is the part that needed no decision.
>
> *The original entry, kept because it is the brief the work was done against:*
>
> **~~A. THE DRUM SECTIONAL ARC~~ — the largest open item in the file.** Reported:
> *"there is meant to be a sections type pattern with the last section having
> the most change, and other sections taking away something or adding or
> altering."* The fill half was one condition and is fixed (`08r`); this half is
> not built at all. The phrase letters A/B/C/D exist INSIDE a 4-bar material;
> what does not exist is a section-scale arc of subtraction and addition — the
> thing that makes the seventh verse different from the second by having LOST
> something. `rhythm-phrasing.md` §2 has the source ("the larger the change in
> the next section, the more anticipation we can create for it"). **Note that
> the hand-on-the-roll editor now gives this somewhere to land**: a section can
> own a private copy of its material, which is exactly what an arc needs.
>
> **B. MINIMAL TECHNO'S ECHO.** *"He uses echo to get more notes. We have too
> much bass and not enough fx."* Half acted on (`roleGain.bass` 0.62 → 0.50);
> the other half is the delay's own feedback and wet/dry, which is a mix
> judgement and **needs the owner's judgement, not arithmetic**. The bass is already
> fully sent to the echo, so this is not a routing fault.
>
> **C. THE EDITS ARE NOT RECORDED ANYWHERE READABLE.** The roll editor works,
> but what the owner chose — rerolled six times, kept the sparsest — evaporates.
> That was half the reason to build it: a log of their choices, in the program's
> own vocabulary, is the only thing that would let the genre tables stop being
> `[CHOSEN]` guesses. Cheap to add, high value.
>
> **D. EDITS DO NOT SURVIVE A RELOAD** and the exports do not carry them.
> Deliberately deferred — *"Slice 3 not needed at this time"* — but it is what
> stands between the editor and "a song I keep".
>
> **E. THE `[CHOSEN]` TAGS WANT AN AUDIT.** Two of them were the whole of the
> "trash bassline", and both were mine. Anywhere a number is tagged `[CHOSEN]` in
> this file, it means MY verdict, and I do not have one.
>
> **F. STILL OWED FROM EARLIER**: the held-back instruments (gamelan/sitar, CC0
> sources identified, `make_sample.py` exists, nothing built); a researched Mega
> Drive sub-style so the YM chip earns its place; DK64 still unmeasured; and the
> saxophone stays parked.

### 6.1 THE CHORD VOCABULARY STOPS AT FOUR NOTES — the root cause

`chordTones` (line 841) is the whole of chord construction:

```js
function chordTones(root, mode, d, seventh){
  const n = seventh ? 4 : 3, out = [];
  for(let i = 0; i < n; i++) out.push(degMidi(root, mode, d + 2 * i));
  return out;
}
```

| what | why it is open | what closes it |
|---|---|---|
| ~~**9ths, 11ths and 13ths are unreachable by any code path**~~ **DONE `2026-08-04a`; the code block above this row is STALE and describes a builder that no longer exists.** `chordTones` takes a size of 3 to 7 and a boolean is still accepted, so the six tables that ask the old way cost nothing. | `n` is 3 or 4 and nothing else. There is no extension parameter, no `add9`, no `sus`, no alteration. Two call sites only (13690, 15838). **This is the single highest-value item in this section** — `lofi-harmony.md` §2 finds NOT ONE plain triad across thirteen sourced lofi progressions (maj9, maj13, min11, min9, 7#5, 7b9, dim7, m7b5), and a genre whose chords sit unchanged for two bars needs each chord to be worth sitting on. | An extension/alteration dimension on the chord, declarable per genre, that `chordTones` reads. Constraints not values (Principle 1): a genre declares which extensions it may reach for, the draw decides. |
| ~~**Chord QUALITY is never named — it is implied by mode + degree**~~ **DONE `2026-08-04d`** | There was no `quality` field anywhere in the composer, so a genre could not ask for a dominant IV — which `lofi-harmony.md` §4 identifies as *the* discriminator between the two minor modes lofi lives between. | CLOSED: a chord can be told what kind it is, and that decides its first four notes; anything above a seventh still comes from the mode, so extensions stay diatonic and a modal genre keeps its colour. The kinds and their likelihood per step are MEASURED from 1170 jazz tunes (`CHORD_QUALITY`, generated by `corpus/ingest_chord_quality.py`), not asserted. A genre declares `qualities` 0..1 — its appetite for the table — and the draw runs either way, so six genres are byte-identical across 300 seeds each. lofi asks 0.75. **And it produced the discriminator by itself**: seed 1 went `C#m7 F#m7 C#m7 G#m7` → `C#m7 F#7 C#m7 G#m7`, a dominant fourth, from a corpus that has never heard of the genre. Research: `docs/genre-research/chord-quality.md`. |
| **A melody drawn from the scale can now clash with a chord note that is not in it** | New, and caused by the row above. A chord can hold a note the scale does not, but the tune is still drawn from the scale, so the two can sound a semitone apart. MEASURED, lofi: **16.2% → 18.7%** of lead and counter notes sit a semitone from a chord note in the same bar. For scale, the six genres with no chromatic chords at all sit between 13.6% and 19.9%, so lofi is still inside the band it was in — but it went up, and it went up for this reason. | The fix is not to the chord, it is to the tune: `buildTheme` should know the chord's chromatic notes are available to it, the way a player does when a borrowed chord arrives. Until then the dial is `qualities`. |
| **`sevenths` is a per-genre BOOLEAN, and 6 of 7 say false** | lofi `true` (8618); synthwave, dkc, bladerunner, acid, jungle, plastikman all `false`. **DKC's own comment (10109) says "Wise's harmony is add9 and sus, not stacked sevenths" — a genre asking in writing for something the engine cannot build, and getting plain triads instead.** | Falls out of the two rows above. |
| **`triadTones`' dominant flag is dead** | `tri.dom` is set by NOTHING (`grep "dom:"` → no producer), so `!!tri.dom` at 13707 is permanently false. The comment at 895 says this flag "is what makes a secondary dominant pull." There are no secondary dominants. | Either wire it or delete it. A flag nothing sets is this file's cardinal sin with a comment on top. |

### 6.2 WIDER CHORDS — measured, and the target is sourced twice

| what | why it is open | what closes it |
|---|---|---|
| ~~**The comp spans 14.0 semitones on lofi; the target is 24+**~~ **DECIDED `2026-08-04k`, and the premise was half wrong** — `docs/genre-research/comp-register.md` | The register decision is made and written down: downward the walls stand (bass owns the bottom, low interval limit); upward the band is the comp's HOME and a genre may declare `registers.keysUp` reach for open voicings (lofi: 12; six genres byte-identical, 195/2100 snapshot lines all lofi, re-baselined `bcd4e05a9f76a4f5`). **Building it falsified the old row's diagnosis**: the ceiling never bound the span — an A/B showed open voicings already at 19.3 mean / 23 max beneath it. The wall is interval arithmetic: no octave rearrangement of a four-voice chord passes 23. And the sourced target is already met by the ENSEMBLE: every source's two-octave spread includes the root, the bass plays it here, and bass+comp sounding together measure **26.5 mean / p50 28 / ≥24 in 73% of moments**. What shipped: lifted shapes, the left hand's octave double, a duplicate-pitch guard. Net: sounding span 14.0 → 15.4, comp-over-tune 14.6% → 17.1%. | STILL OPEN, for the owner, with numbers attached: (1) the TALL COMP — anchoring at the granted room's centre reaches 24+ spans in 24% of open voicings and costs 49.8% comp-over-tune (3.4× before); refused as the default per the sax precedent. (2) the EXTENSION RATE — five-tone chords reach 26-span under the tune; a harmony dial, not to be moved before the 04-stack is heard. |
| **`isOpen` is a BINARY, so a 13-semitone spread and a 30-semitone spread score identically** | 14584: `(cand[cand.length-1] - cand[0]) > 12`. The cost function can prefer "open" but cannot prefer "wider" — there is no gradient to climb even if the band allowed it. | A continuous spread term in the cost. Cheap, and a prerequisite for the row above doing anything. |
| **Drop-2 exists; drop-2-&-4 does not** | 14591–14594 generates one drop-2 per inversion. `lofi-harmony.md` §5 names drop-2-&-4 as the voicing that "spans nearly two octaves" — i.e. the actual mechanism for the target above. | Add it to the candidate generator. One loop. |
| **Rootless voicings are not built, and this program is the ideal case for them** | The sources' rationale is that a separate bass plays the root [corpus:pianowithjonny] — which is exactly this architecture. Rootless is also what MAKES ROOM for a 9th without a sixth voice. Pryn, voicing Cmin9 as C–B–D–G: "remove the fifth altogether because it is not essential to the harmony." | Depends on §6.1. |
| **Voices are paired by SORTED INDEX in the voice-leading cost** | 14644: `for(let i = 0; i < Math.min(cand.length, prev.length); i++)`. A 4-note chord following a 3-note one silently drops a voice from the comparison, and the extra voice contributes only through the `×2` top-line term. Latent today because chord size is constant within a song; **it goes live the moment §6.1 lands** and chords vary in size. | Fix before, not after, extensions land. |

### 6.3 COUNTERPOINT — the horizontal rules do not exist

**Verified: `grep -i "parallel fifth\|parallel octave\|perfect fifth\|voice cross\|similar motion\|oblique"` over the whole HTML returns ZERO hits — in code AND in comments.**

| what | why it is open | what closes it |
|---|---|---|
| **⚠ AND THE ROW BELOW IS NOW PARTLY FALSE — re-measured per PAIR `2026-08-05`** | `probe_counterpoint` could only report one average per genre, which "hides the finding" (§6.6). It reports per pair now, and the claim that *every genre's worst pair involves the bass* no longer holds: the worst RATIO in the file is **keys↔keys2**, the two keyboards shadowing each other — bladerunner 8.9% against a 0.9% floor, lofi 4.2% against 1.1% — on both of the only two genres that have a second keyboard, and no row anywhere had ever named it. lofi's bass pairs are at or near chance since `04e`; acid, plastikman and jungle are at or BELOW chance. | **DONE `2026-08-05f` for the keyboards** — a cost in `buildKeys` against the other keyboard's top voice, `docs/genre-research/the-second-keyboard.md`. Material bar-to-bar: bladerunner 13.0% → 9.1%, lofi 3.5% → 1.2%; 19 of 2100 songs moved. **STILL OPEN and honestly so: the PERFORMANCE figure barely moved (8.9% → 8.1%) and §7 of that sheet says what has been ruled out and what has not.** The bass pairs that remain (dkc 10.3%, bladerunner 10.1%) belong to those genres' *declared* pedal and drone and are a taste question with an owner. |
| **THE PARALLELS ARE BETWEEN THE CHORDS AND THE BASS, not between the two melodies** — measured `2026-08-04` against Bach | 382 chorales with their four voices still lined up in time run **0.127%** parallel fifths and octaves. Broken out by pair, 30 seeds a genre: **lofi keys/bass 8.97%**, synthwave keys/bass 19.06%, dkc lead/bass 22.95%, bladerunner bass/ostinato 15.89%, acid keys/bass 7.97%. **Every genre's worst pair involves the bass**, and in five of them it is the chords against it. The shipped probe's single per-genre average hides this completely. | One cost term in `buildKeys`, which already scores voice-leading between successive voicings and has never been shown the bass — and the bass is built first in `makeMaterials`, so it is there to pass in. **A counter-versus-lead version of this was built and REVERTED**: it moved lofi 2.03% → 2.70% on 3 events, because it was aimed at the pair that was not the problem. `docs/genre-research/counterpoint-measured.md` §5. |
| ~~**A dissonance is constrained on the way out and not on the way in**~~ **DONE `2026-08-05e`** | Bach approaches a clash by step **96.8%** and leaves one by step **91.3%** — fractionally stricter arriving than departing, and this program had a law for the departure and nothing for the arrival. | CLOSED. `docs/genre-research/the-arrival-of-a-dissonance.md`. Of the eight figures in the taxonomy, seven are approached by step or repetition and only the appoggiatura leaps in, on the condition that it steps out [three sources]. So: a dissonance may be leapt onto only when something follows closely enough to resolve it. A NARROWING in the tune, a COST in the counter. **Arrivals by leap 16.5% → 14.3%, by step 67.7% → 70.0%; on the population the law governs, 9.5% → 4.8%.** 636/2100 seeds, form and arrangement identical on every one. STILL OPEN, in §7 of that sheet: the phrase's FIRST note has no arrival (`hang` resets at the join), and the owner has judged none of it. |
| **Contrary motion is one flat number where the measurement gives six** | Bach's outer pair (soprano/bass) moves contrary **32.9%** of the time and his inner pair (soprano/alto) **14.0%** — every pair involving the bass sits at 28–33%, the two inner pairs at 14%. Ours is a fixed +100 scored against the lead only. | Grade it by which two parts. |
| **Oblique motion is the majority relationship and we have no notion of it** | **51.7%** of Bach's moments are one voice holding while another moves — more than contrary, similar and parallel combined. Nothing in this program thinks about it. | Measure ours first; there is no target until then. |
| **Nothing measures or constrains the interval between two parts** | The only cross-part constraint in the composer is a `reserved` set banning two parts from the same absolute pitch at the same instant — the degenerate case of a parallel unison — plus the counter's contrary-motion preference. `probe_theory` already half-recognises the issue from the other end, measuring "unisons" and calling one "a part disappearing rather than a chord" (lofi 8.8%). | `harness/probe_counterpoint.js` now measures it. The mechanism should follow the research's sorting (`counterpoint.md` §2): parallel perfects are PERCEPTION (fusion) and belong in stage 3 for every genre — **but only where `counter.style === "line"`**, because `"double"` is deliberate parallel octaves and the tables already say which is which. |
| **MEASURED at this commit (30 seeds a genre), parallel perfect vs a seeded-shuffle floor** | lofi 1.7% (chance 1.4), synthwave 6.0% (1.7 — the deliberate double), dkc 1.6% (1.1), bladerunner 2.6% (1.8), acid 1.3% (1.0), plastikman 0.7% (1.2), **jungle 24.5% (0.7)**. **CAVEAT, and it matters: the shuffle floor destroys the harmonic relationship between parts, so two lines that both correctly track the same chord changes will sit far above it without that being a defect.** The floor answers "more than random", NOT "wrong". | Do not treat the ratio as a defect count. The honest reading is that only jungle is a clear outlier, and §6.5 says what it actually is. |
| **The counter's contrary-motion rule is measured against the LEAD only, and is a flat +100** | 15514–15520. The comp's top voice — which `buildKeys` itself weights ×2 because "it is the line the line follows" — is never consulted, so the counter can move in lockstep with the part the owner is actually tracking and pay nothing. And a flat penalty cannot separate similar-but-not-parallel from strictly parallel, which is exactly the distinction the sources draw. | Score against the comp's top voice as well, and grade the penalty by motion type. |
| **Leap-then-step is not built** | The non-chord-tone law narrows the note after a *dissonance* to one scale step, but nothing reads the previous interval for the plain melodic case: after a leap, prefer to step back, and "do not write more than one skip in the same direction" [corpus:hellomusictheory]. | A cost term in `buildTheme`'s candidate walk. |
| **Voice spacing is unconstrained** | No rule keeps adjacent voices within a tenth. | A cost, never a law — lofi's counter band `[57,74]` sits INSIDE its keys band `[52,74]`, so a hard rule is unsatisfiable by construction. |
| **Voice crossing: DO NOT ADD A BAN** | Recorded here so nobody "fixes" it. It is architectural — the code says so at 15594, *"The counter does not sit ABOVE the comp, it sits INSIDE it"* — and the sources agree that without crossing "no real polyphony is possible" [corpus:ars-nova, quoting Jeppesen]. | Nothing. This is a decision, written down. |

### 6.4 CHROMATICISM — built, drawn by almost nobody

| what | why it is open | what closes it |
|---|---|---|
| **Only ONE genre in the file declares a `harmony` block** | `bladerunner`, line 10446: `harmony: { style: "plr", chance: 0.30 }`. Everything else is 100% diatonic by construction. Measured (`probe_harmony_neo`, 60 seeds): bladerunner 10.4% chromatic chords, **every other genre exactly 0.0%**. | Genre-by-genre research before any table entry — `lofi-harmony.md` §4 already supplies lofi's case (the borrowed dominant IV, "a borrowed chord from another key" [corpus:richardpryn]) and it is the natural second genre. |
| **The measured chord table covers major and minor only; five of this program's seven modes have none** | `CHORD_QUALITY` is keyed by major and minor because the corpus is. Dorian, phrygian, lydian, mixolydian and harmonic minor get no quality drawn at all — deliberately, since sending dorian to the minor table would delete its signature chord (`chord-quality.md` §5, §7). But it means lofi's dorian songs get none of the `2026-08-04d` work. | A corpus in those modes, or a genre-declared table written from that genre's own research. Not a guess: the dorian case is exactly where a guess would do damage. |
| **`coltraneCycle` is correct, wired, and unreachable** | Defined 887, called at 13715 under `H.style === "coltrane"`. **No genre declares that style** — `grep "coltrane"` finds only the branch itself. Still true after being flagged in HANDOFF §5.5 for several sessions. | Draw it somewhere with a documented reason, or delete it. The file's own rule, quoted at 13434: do not claim a thing works until something draws it. |
| **The neo path collapses a mode to one bit** | 13718: `min: MODES[mode][2] === 3`. A mode entering the P/L/R path becomes major-or-minor and its character is gone. | Fine for triads; revisit with §6.1. |

### 6.5 SCOPE GAPS in the laws that DO exist

| what | why it is open | what closes it |
|---|---|---|
| **The non-chord-tone law covers `lead` and `counter` only** | `bass`, `keys` and `ostinato` are never checked. A comp inner voice or a bass note may leap away from a dissonance freely. Whether it *should* be constrained is a real question — a bassline is not a melody — but it is currently unasked, not decided. | Decide per role, in writing. |
| **"Resolves by step" is hardcoded as ≤2 semitones** | So harmonic minor's degree 6→7 (an augmented second, 3 semitones) is a genuine scale step that the law refuses as a resolution. Latent — no genre draws `harmMinor` today. | Ask the MODE what a step is, rather than assuming a tone. |
| **`harmMinor` is defined in `MODES` (830) and drawn by NO genre** | Dead vocabulary in the theory block itself. | Draw it or drop it. |
| **`intoBand` assumes a band ≥12 semitones wide and never checks** | 912. The comment says "band width >= 12 assumed"; nothing enforces it, and a narrower band would oscillate. | A guard, or a stated invariant with a seam check. |
| **jungle has only TWO pitched parts and they shadow each other** | Measured: its only pair is bass↔keys; **69.9% of their vertical intervals are perfect (unison/octave/fifth) and 0.0% are dissonant**, with 24.5% parallel-perfect motion. `counter: null` is deliberate and defended, but the result is a genre whose entire harmony is two lines mostly a fifth or an octave apart. | A genre-identity question, not a bug. Jungle's harmony has never been researched (only its form has — `jungle-form.md`). |
| **synthwave's octave double flips octave on 13.1% of notes** | Measured: `octaves: [-12, 12]`, 86.9% at −12 and 13.1% at +12, because it takes whichever fits the band unreserved. Each flip is a two-octave leap in the counter against a stepping lead. | An TASTE question, recorded not judged. If it is wrong, the fix is to prefer the previous offset. |
| **lofi's register comment is false** | 8636 claims the bands "overlap only at the edges — a countermelody that never crosses the comp is not one." Declared: counter `[57,74]`, keys `[52,74]` — the counter is a strict SUBSET. The code at 15594 states the truth. | Correct the comment next time the file is touched. |

### 6.6 THE MEASUREMENT SIDE — what the probes cannot see

| what | why it is open | what closes it |
|---|---|---|
| **`probe_theory` hand-copies a MODES table that has drifted from the engine's** | Its table (line 40) is MISSING `harmMinor` and ADDS `locrian` and `aeolian`, neither of which the engine has. A `harmMinor` song would fall through `MODES[mode] \|\| MODES.minor` and be silently measured against natural minor. **Latent — no genre draws harmMinor, so nothing is misreported today.** But this is the "anything that LISTS what the program contains will go stale" defect for the fifth time. | Export `MK2.MODES` and derive. |
| **`probe_comp` measures texture, not harmony** | Six numbers: simultaneity, onsets/bar, voices/onset, inner movement, bar repeat, span. **No chord identity, no inversion distribution, no voice-leading distance between successive voicings, no check that the voicing is even the chord.** It is a texture probe wearing a voicing name. | Add the harmonic half — it is the natural place to verify §6.1 and §6.2 once they land. |
| **`probe_harmony_neo` reads the abstract chart, never the played pitches** | It reads `song.materials.chords`, so it says nothing about what is actually voiced and heard. Its voice-leading number is a SET distance (line 35), order-free, and therefore cannot detect voice crossing or parallel motion by construction. | Point a version of it at `materials.*.keys`. |
| **`mk2_ui.js` IS FLAKY — about one run in five reports one failure and the next run is clean** | Seen twice on 2026-08-04 on two unrelated commits, again on 2026-08-07 (one run 43/1, the next four clean). **NAMED AT LAST, 2026-08-08:** the reprint added at `07o` caught it — it is **"...and the dot actually travels while the pointer stays put"**, and on that run it read `tr1000.sCut rotate(135deg) -> rotate(135deg)`, i.e. the automation dot had not moved between the two samples. Two immediate re-runs were 57/0. **So it is a browser-timing flake and not a defect in the program**, and now there is a specific check to fix rather than a rumour. | The check waits up to 25 × 120 ms for the dot to move (`mk2_ui.js` ~396). A control whose lane is momentarily flat — a section boundary, a slow LFO at its turning point — will not move in three seconds, and the check reads that as failure. Pick a control that is *known* to be moving at that instant, or assert against the motion plan rather than against the pixel. Until then, a red run must be re-run and BOTH results reported. |
| **`mk2_roll.js` SILENTLY COMPOSES THE WRONG GENRE if you pass a bare name** | `node harness/mk2_roll.js 1 acid` composes **lofi**. The genre is a named flag, `--genre`, and a positional argument that is not a rig name is simply ignored. This produced a false "all seven genres are identical" claim on 2026-08-04 from seven runs of the same genre; the conclusion happened to be right and the evidence was worthless. Now a rule in README and HANDOFF §0. | Make it THROW on an unrecognised bare argument rather than ignore it. A tool that quietly answers a different question than the one asked is worse than one that fails. |
| ~~**`probe_counterpoint` reports one number per genre and that average hides the finding**~~ **DONE `2026-08-05`** | Its headline was parallel-perfects averaged over every pair of parts, and **a fix was built for the wrong pair because of it.** | CLOSED: every pair with ≥100 shared steps, ranked worst first, each against ITS OWN shuffle floor (a slow pair and a busy pair do not have the same chance rate). The deliberate octave double is MARKED rather than filtered. It immediately falsified §6.3's headline claim — see the row there. Remaining limit, unchanged and stated in the probe's header: each role is reduced to its top note, so a parallel fifth buried among a comp's inner voices is still invisible. |
| **`probe_theory` hand-copies a MODES table** — *`MK2.MODES` is exported as of `2026-08-04d`, so this is now a one-line fix* | (see the row below; the blocker is gone) | Derive from `MK2.MODES`. |
| **`probe_counterpoint`'s floor control is generous, and its top-voice reduction hides inner voices** | Both stated in the file's own header. The shuffle floor breaks the chord relationship (see §6.3), and reducing each role to its top note means a parallel fifth buried inside a comp voicing is invisible. | A better floor would shuffle whole chord-aligned bars rather than individual pitches. Inner voices need the pair enumeration to run over voicing members, not roles. |

### 6.7 THE GROUNDING GAP — measured harmony exists in this repo and MK2 cannot see it

**`JAZZ_CORPUS`, `BACH_CORPUS`, `IMPROV_DIMENSIONS`, `FOLK_CORPUS` appear ZERO
times in `Deckards Orchestrator MK2.html`.** `corpus/` holds working ingesters
for all of them, and they target MK1:

- **`ingest_jazz.py`** — the **Jazz Harmony Treebank**, 1170 standards' chord
  changes (EPFL DCMLab), already converted to a relative `{degree, quality}`
  encoding with frequency weights. **Lofi's harmony is jazz harmony slowed
  down**, so this is the right instrument for exactly the question §6.1 asks,
  and it would replace most of `lofi-harmony.md`'s tutorial-grade sourcing with
  measured structure — the top of this project's own grounding ladder.
- **`ingest_bach.py`** — 382 chorales as four independent voices. That is a
  measured corpus of *counterpoint*, which is §6.3's whole subject.
- **`harvest_accompaniment.py`** — POP909, what an accompaniment actually plays.

**PARTLY DONE `2026-08-04d` — the jazz harmony is in, and re-derived rather than
reused.** `corpus/ingest_chord_quality.py` reads `treebank.json` from source and
fixes three faults in `ingest_jazz.py` that made the MK1 table untrustworthy: it
read flat keys a semitone sharp (445 of 1170 tunes), it could not see a
half-diminished chord at all, and it folded every chromatic chord onto the
nearest scale step. **The chorales and the ensemble data are still not in, and
they are the two that matter for §6.3 and for the arrangement.**

**This outranks every other item in §6.** Every chord-quality weight and every
counterpoint rate this section proposes is currently `[CHOSEN]` or sourced from
production tutorials; the treebank and the chorales would make them measured.
What closes it: port one ingester to MK2's tables and re-derive. Start with
jazz — it is the one whose subject matter matches a shipped genre.

### 6.8 THE BASS PLAYS THE ROOT AND ALMOST NOTHING ELSE — and it has never been researched

*Measured 2026-08-04, 30 seeds a genre. Found while failing to fix §6.3's
parallel fifths from the other end: no amount of re-voicing the chords can undo
a lockstep the bass is enforcing.*

```
  genre         notes    the root   the fifth   anything else   repeats its own note
  lofi            744      74.7%       16.9%            5.6%             30.9%
  synthwave      2767      90.7%        9.3%            0.0%             42.3%
  dkc             664     100.0%        0.0%            0.0%              0.0%
  bladerunner     290     100.0%        0.0%            0.0%              0.0%
  acid           3988      61.7%        7.3%           24.7%             44.9%
  plastikman     1608      79.1%        1.0%           19.9%             62.8%
  jungle          128     100.0%        0.0%            0.0%              0.0%

  distinct notes in a bar:  lofi 1 note in 61% of bars · dkc, bladerunner and
  jungle 1 note in 100% of bars
```

| what | why it is open | what closes it |
|---|---|---|
| ~~**THE BASS HAS NEVER BEEN RESEARCHED FOR ANY GENRE**~~ **LOFI DONE `2026-08-04e`; the other five still open** | `docs/genre-research/bass.md`. The note CHOICE turned out defensible — root and fifth is a sourced lofi habit — and the MOTION was the fault: the bass's off-downbeat choices were `root`, `fifth` or `rest` and nothing else, so those were a ceiling rather than a habit. Now a genre table (`bassTones`) that can also name the third, the seventh and a passing step. Measured on lofi: bars holding one pitch **61% → 42%**, step motion **28.8% → 38.6%**, the third **2.7% → 10.3%**, repeats-its-own-note **30.9% → 14.2%**. Six genres byte-identical. **And it cut the parallel fifths the chord side could not touch: lofi keys/bass 8.97% → 5.56%.** | STILL OPEN for jungle, acid and plastikman (no research at all) and synthwave (tutorial sources only). dkc and bladerunner are done and correct — a declared pedal and a declared drone. |
| ~~**The chromatic approach note is blocked by a seam check**~~ **DONE `2026-08-04f` — the law was widened, and the widening is a constraint** | The most characteristic move in the walking rules is a half-step above or below the NEXT chord's root. That note belongs to the chord arriving, not the one sounding, and the law only ever asked about the chord underneath. | CLOSED. **Every non-chord tone in the classical taxonomy is defined by MOTION, not by what it sits over** — passing, neighbour, appoggiatura, escape tone and anticipation, four sources, and not one of them mentions the chord below. So the law asks two questions now and both are strict: the chord under it contains it, OR it resolves by a step or less into a tone of the chord that follows. Clause two is an OBLIGATION — the very next note in that part must itself be a chord tone within a step — so a stray note cannot acquire one. **The widened law alone moved nothing across 2100 seeds**, which is the right shape for a law, and then it immediately caught a real bug: `intoBand` folds a pitch back by octaves, so a semitone below a low root returned an octave and a semitone from its target. That note is now DROPPED, not moved. `docs/genre-research/the-note-that-does-not-belong.md` | The most characteristic move in the walking rules is a half-step above or below the NEXT chord's root, on the last beat. That note belongs to the chord that is arriving, not the one sounding — and the law says a note outside the key must be in *the chord under it*, so it throws. The existing walk takes a SCALE step for exactly this reason. | Widening that law to know about the chord that is arriving. A real decision about the law, not a tweak — which is why it was not done quietly. |
| ~~**THE BASS HAS NEVER BEEN RESEARCHED**~~ *(superseded row, kept for the measurement)* | `lofi-production.md` §9 says it outright — "nothing on how the bass is written beyond 'smooth and simple'". Every bass number in the program is a guess or an inference from the drums. **This is the same shape of hole the chords had before `2026-08-04d`**, and the chords turned out to be 20 dB — figuratively — off once measured. | Research per genre, named sources, before any table moves. Start with lofi: it is jazz-descended, where a bass genuinely walks, and it is the genre being judged. |
| **It is the cause of §6.3's parallel fifths, and the chord side cannot fix it** | If the bass always plays the root, then when the chord changes the bass moves by exactly the interval the chord moved, so any gap between them survives — a parallel by construction. Proved by failing: a cost on the chords' top line against the bass was built, and raising its weight FOUR TIMES moved nothing. `counterpoint-measured.md` §5b. | Give the bass somewhere else to be: approach notes, passing notes, a walk into the next chord, the third or the fifth under a chord it does not need to spell. |
| **`harvest_bass.py` measures 17,256 real arrangements and MK2 has never seen a number from it** | Written for MK1, like the chorales and the ensemble data. §6.7 is the same story one instrument over. | Port it, the way `ingest_chord_quality.py` was ported — and check its parsing against the source first, because the last MK1 ingester that was trusted had three bugs. |
| **jungle's HARMONY is fixed; its BASS is not** — `2026-08-04g` | Its harmony had never been researched, and that turned out to be half wrong: `jungle.md` researched it in July and the table never received it. The sheet says the genre has "two harmonic worlds", the drone and "THE JAZZ-MINOR VAMP… airy pads, jazz-inflected chords", and the table said `sevenths: false`. Confirmed independently — "lush minor chords, jazz extensions (9ths/11ths/13ths)" [corpus:melodigging]. Fixed: **dissonant intervals 0.0% → 13.5%**, pitched moments 374 → 801, and seed 1 went from three identical triads to a i–iv vamp with sevenths. | STILL OPEN: the bass. Parallel fifths only fell 21.7% → 19.2% because the bass is still 100% root, one note a bar, so it and the chords still move together at every change. `jungle-harmony.md` §5: the sources give "roots, octaves, fourths/fifths" and pentatonic and nothing more, which is not enough to write a bassline from. **Do not guess it.** |
| ~~**jungle plays the root, one note a bar, 100% of the time, and nothing defends it**~~ **DONE `2026-08-04l`** | Researched (`docs/genre-research/jungle-bass.md`) and built in consecutive commits. The cause was that jungle wore `bassStyle: "drone"` — restrikes only on a chord change, under a harmony that mostly does not: 99.8% of bars held ONE pitch. Now `bassStyle: "riff"`, a cell drawn once and repeated over the declared two bars, position deciding the pool (anchor root/3rd/5th on strong sixteenths, spice 2nd/4th/7th elsewhere), rank-selected rests, slide through `acidize` as every style gets it. | CLOSED. **Matched A/B, `probe_counterpoint` 20 seeds, jungle's row only: parallel perfect keys/bass 19.2% → 0.8% against a 1.1% chance floor; contrary motion 30.2% → 40.7%. Bars holding one pitch 99.8% → 14.4%, distinct pitches a bar 1.00 → 2.35.** Every other genre identical to the digit; snapshot 300/300 jungle and nothing else. **This is §6.8's "the chord side cannot fix it" row answered from the bass side.** STILL OPEN: every count in `bassRiff` is `[CHOSEN]` (no source gives one), and whether the riff should transpose with the chord is undecided by the sources — it follows the acid builder's precedent, recorded not proven. |

## 6a. THE LOOP REPEATS AND ALMOST NOTHING CHANGES — ~~open~~ **LARGELY FIXED `2026-08-04a`**

*The user, 2026-08-03, on lofi seed 1: "it feels like we are repeating the same
loop with no changes after three passes — that violates the rule of three."
Measured after: they are right, and the numbers are worse than the complaint.*

**HOW MUCH THE SAME IT IS.** Comparing the notes of each statement of a section
against the FIRST time you heard that section (100% = note for note identical,
on the beat grid, 20 seeds a genre):

```
  lofi         2nd chorus 97%   3rd chorus 95%   2nd verse 97%   3rd verse 92%
  synthwave    2nd chorus 99%   3rd chorus 98%   4th chorus 99%  2nd verse 99%
  dkc          2nd chorus 98%   3rd chorus 96%   4th chorus 96%
  bladerunner  2nd chorus 99%   3rd chorus 99%   2nd verse 99%
  acid         2nd chorus 100%  3rd chorus 100%  4th chorus 100%   <- identical, always
  plastikman   2nd verse 87%    3rd verse 79%    4th verse 77%     <- the only genre that varies
  jungle       2nd chorus 96%   3rd chorus 96%   3rd verse 72%
```

And *inside* one section, on lofi seed 1: each bar shares an average **60%** of
its notes with the bar one loop earlier, and through the two back-to-back
choruses (bars 12–20) it runs **85–93%**. The chord sequence is a single
four-chord loop for the entire song and never changes.

| what | why it is open | what closes it |
|---|---|---|
| ~~**The "third time" rule almost never fires**~~ **DONE** — it counted section names; the person playing it counts four-bar passes, and one section is two passes, so the threshold is now the SECOND section. | (was)  | The demand is raised on the third statement of a *section function* (`seen[f] >= 3`, and only for verse and chorus). A lofi song is 44–64 bars with 6–8 sections, so a verse usually appears **twice** and never reaches three. On seed 1 the verse never varies at all. | Count what the person playing it actually counts. They hear the **four-bar loop** go round, not section statements — an 8-bar chorus is two passes, and two choruses back to back is four identical passes. The rule should fire on the third pass of the same material, not the third section bearing the same name. |
| ~~**When it does fire on a chorus, the answer barely changes anything**~~ **DONE** — the chorus gained `Bvar`, built exactly as `Avar` is: same opening two bars, redrawn tail. It no longer answers by deleting. | (was)  | The response is `stripHalf` — take some notes out. Measured, the third chorus still plays **95%** of the first chorus's notes. Taking notes away does not make something sound new; it makes it sound like the same thing, quieter. | The verse's answer is the right shape and already exists: it swaps in `Avar`, a genuinely redrawn second half. The chorus has no equivalent. Give it one. |
| **acid repeats note-for-note, 100%, forever** | Not a rounding artifact — every statement of every section is bit-identical. | acid may want that (it is a machine-music genre) but it has never been decided in writing, and 100.0% is the number that says nobody chose it. |
| **Only 4 knob lanes step on a repeat in lofi seed 1** | The project's own history says the rule of three should be answered by *timbre* rather than by rewriting notes, and added `occurrence` knob lanes for it. Four lanes across a whole song is not enough to be heard as "this is the third time". | More `occurrence` lanes on the genres that repeat most, and a measurement of how far they actually travel. |

## 6b. LOFI — WHAT THE PRODUCTION RESEARCH FOUND

*Added 2026-08-03. Research: `docs/genre-research/lofi-production.md` (15
sources on song construction, production and FX, plus Moore's textural layers
from a peer-reviewed journal). Measured on build `2026-08-03q`, 30 seeds,
1620 bars. Every row here is a number against a source, not an impression.*

| what | why it is open | what closes it |
|---|---|---|
| ~~**Five or six parts sound together in 61% of lofi bars**~~ **DONE `2026-08-04o`** | The mode was FIVE against a sourced "not more than 3 or 4 elements" [corpus:modeaudio]. **The count was the symptom; the structure was the fault** — Moore's four layers are beat, bass, MELODIC, harmonic filler, and lofi carried two melodic (lead + counter) and two harmonic (keys + keys2), so the chorus doubled half the texture. | CLOSED: `counter: null`, the declaration acid/plastikman/jungle already carry for the same reason. The harmonic doubling STAYS — `keys2` is the sourced "different dress" of the chorus. **Measured: parts/bar 4.06 → 3.71, chorus 5.38 → 4.50.** Moving the counter to the instrumental was tried first and the battery refused it (composed every song, heard in 13 of 60). `lofi-production.md` §7b. |
| ~~**`keys2` plays in most bars and NO `form.roles` entry asks for it**~~ **DONE `2026-08-03r`** | The arrangement added a second keyboard to every section that had anything pitched, because it tested `picks[slot] !== "auto"` — true both when the USER loads a machine into a rack AND when the COMPOSER draws one from the genre's own table. The stated justification ("not a veto over a machine the user has deliberately loaded") is right and did not cover the second case. MEASURED, 100 seeds: drawn in 60% of lofi songs, and in those songs playing in **98.2% of every bar** — it never sat out. **(An earlier row here said 72.7% of all bars. That was wrong — small-sample noise over 30 seeds, and reproduced independently by a second measurement, which is why two agreeing numbers are not proof.)** | CLOSED: `picks.byHand` records whose choice each slot was; the auto-add fires only for a hand-loaded machine; genres name `keys2` in `form.roles` where they want it — lofi on the chorus alone ("the same loop in different dress"), bladerunner across the body of the cue since the VP-330 IS that score's bed. Result: lofi 98.2% → **39.6%** of bars in songs that have it, parts-per-bar 4.62 → **4.07**. Blast radius: only the `keys2` role moved, only in those two genres (lofi 144/300, bladerunner 150/300); every other role and genre byte-identical. |
| **The density is SUSTAIN, not onsets** | Measured simultaneity (notes ringing at any instant): lofi **10.30**, second of seven behind bladerunner's 10.55 and well above synthwave's 8.66. The drums contribute only **0.68** of that; **8.70 is sustained pitched material** — `keys` at 1.54 s per note and `keys2` at 2.53 s. So anything that thins by deleting notes will barely move it. | Know this before acting on the row above: the lever is note LENGTH and how many parts hold at once, not note count. The existing `arc.thin` mechanism removes notes and would therefore be the wrong tool. |
| **The sourced dropout barely happens, and sections never vary in length** | §3's sourced shape has "occasional dropout sections". The only lofi section that drops the drums is the bridge, which occurs in **7 of 30 songs**. And across 229 sections, verse/chorus/bridge/instrumental were **always exactly 8 bars** and intro/outro always 4 — zero variation. | Both are `form` table questions (`lengths`, the transition weights, `bridgeAfterChorus`). Cheap, and it is the one place the production research and the form research agree the program is short of the sources. |
| ~~**No bitcrush / sample-rate reduction anywhere**~~ **ANSWERED `2026-08-04c` — measured, and NOT built** | The tutorials say 12-bit, after the machines the genre grew out of (SP-1200, MPC60). But an ideal converter's own noise is `6.02n + 1.76` dB down [corpus:analog.com MT-001], which puts 12-bit at **74 dB below full scale** — quieter than a record, quieter than tape, and quieter than this program's own crackle. Measured rather than calculated, by quantising the real render and weighing the error signal against the noise the record already has: **12-bit sits 11.1 dB UNDER it**. It would be a control that does nothing. | CLOSED by not building it — the same verdict the deep low-pass got, reached the same way. **Two things worth keeping:** 12-bit is buried partly *because* the crackle went up 17 dB (against the old crackle it was only 6 dB under); and **8-bit measures 12.9 dB ABOVE the noise floor and would be plainly audible**. So if this sound is ever wanted, the number is 8, not 12, and it is a distortion decision rather than a fidelity one. `lofi-noise.md` §6e. |
| ~~**No sidechain / ducking anywhere**~~ **DONE `2026-08-04c`** | Zero occurrences. Both sources that raise it treat it as standard and **disagree on how hard**. The tie is broken by the one hip-hop-specific source: "heavy-handed pumping is generally undesirable in hip-hop… a fast attack of 2-5 ms and a short release of 40-80 ms on the bass, triggered by the kick, creates a **barely audible duck**" [corpus:musicproductionwiki], with 2-3 dB the usual starting point [two further sources]. | CLOSED: one gain per bus, sitting between the bus and everything downstream — a channel insert, ahead of the fader and ahead of the sends. Built for every bus unconditionally and left at 1, so a genre that declares no `space.duck` renders what it always did. Triggered in `dispatch()` so live and offline duck identically. lofi declares 2.5 dB, 4 ms on, 65 ms off, on the bass, the chords and the record surface. **Measured, 24 bars of seed 1: all 46 kicks, typical -2.37 dB, deepest -2.75, back within half a dB in 80 ms. synthwave and acid, which declare none: 0.00 dB.** `lofi-noise.md` §6d. |
| ~~**Flutter is modelled on the Mellotron only**~~ **DONE `2026-08-04c`** | The genre-level `tape` block carried `wow` but no `flutter` and no `hiss`, so both existed only inside one instrument that lofi draws in 5 songs of 30. | CLOSED: `tape.flutter` and `tape.hiss` beside `tape.wow` and `tape.crackle`, drawn per song, declared by all seven genres so the table has one shape. Standards split the two by rate and nothing else — wow 0.5-6 Hz, flutter 6-100 Hz [two sources] — so the file now has one pair of rates (`TAPE_WOW_HZ`, `TAPE_FLUTTER_HZ`) instead of a literal per machine. lofi turns them on; the other six declare `[0, 0]`, which is why nothing else moved. |
| ~~**The deep low-pass never reaches the chords and melody**~~ **ANSWERED `2026-08-04` — it is already true, and nothing needs building** | The sources' most specific instruction is a low-pass pulled down to 2-8 kHz (four sources: 2 kHz [modeaudio], "typically 4 kHz" and "3-4 kHz simulates old radios, tape players and vinyl" [audeobox], "roughly 6500 Hz" [sageaudio], "above 8 kHz" for pads and pianos [lofimusicacademy]), applied to individual instruments and explicitly NOT to the master ("filtering the entire mix removes the air and sparkle... better to address the brightness on individual tracks" [audeobox]). **A filter was built for the pitched buses, wired, verified in the signal path — and then MEASURED AT 0.13 dB OF EFFECT.** The reason: this program is already dark by construction. Measured on lofi seed 1, share of energy above 2 kHz: whole mix **-17.7 dB** (1.7%), drums **-22.4 dB**, chords **-20.2 dB**. A 2 kHz low-pass on material that holds 1% of its energy above 2 kHz can only remove about 0.04 dB, which is what it did. | CLOSED by reverting the filter. Shipping a control measured at 0.13 dB, with a genre declaring values for it, is exactly the knob-that-does-nothing this file forbids. The instruction is satisfied by the instrument and drum-voice design instead of by a filter, which is a better answer than the sources give. **If a future genre IS too bright, the per-drum lowpasses already exist (lofi: snare 8k, hat 11k, open hat 9k, toms 6k) and are the right place.** Three measurement errors were made getting here and are worth knowing: measuring a single low Rhodes note that had no top end to remove; leaving the bass in, which dominates the energy and hid the chords; and putting the code inside the drum-chain block so it only ran when a drum machine was loaded. The filter was proven to be in the path by forcing it to a 21 kHz highpass and watching the chords go silent. |
| ~~**The vinyl crackle rides the KEYS bus**~~ **DONE `2026-08-04c`, and BOTH halves of this row were wrong** | ~~"about 36 dB below the band"~~ was arithmetic on numbers that never meet in the signal path. Rendered: **79 dB below the record's loudest moment**, where a real record's noise sits 55-60 dB below its own peak [corpus:hifiauditions; corpus:headphonesty]. And ~~"is reverberated"~~ is true of the diagram and worth **0.00 dB** in the sound (0.06 dB even at a reverb level 5.6× the genre's). **The real fault was neither: closing the keyboard channel silenced the record surface** — measured, 0.000083 open, 0.000000 shut. | CLOSED two ways. The crackle has its **own matrix row**, with a fader and five blind plates — not six crossings, because five of them would have been knobs that move nothing, and the reason is generated into `MATRIX.none` beside the existing ones. The physical argument: the crackle happens at the stylus, after everything, and never met the band. And the **level went up 15.7 dB** (`crackle [0.006,0.008]` → `[0.040,0.055]`, plus a hiss set under it), landing 61-63 dB under the loudest moment — deliberately just under §1's band, because this models the fizzy part and not the rumble that dominates the real measurement. |
| ~~**`wow` reaches the `keys` role and nothing else**~~ **MOSTLY DONE `2026-08-04c`** | `ev.wow` was set only for `role === "keys"`, so bass, lead, counter and **the second keyboard** got no pitch drift. The sources put wow and flutter "on sustained sounds like **pads** or leads" [corpus:landr] — and `keys2` IS the pad, with the longest notes in the genre (2.53 s). | The second keyboard has it now, and the fast wobble with it: **1894 second-keyboard notes over 30 lofi songs, where there were none**. Not decoration — subtracting one render from the other, the part changes by **4.5 dB** with both off, and by 31.4 dB with only the fast wobble off, which is what a setting at the audibility floor should measure. **STILL OPEN: bass, lead and the repeating figure carry no drift**, and the drift belongs to the TAPE rather than to one player, so in principle they should. Left because widening it further moves six other genres and wants its own playing pass. |
| ~~**THE TUNE IS PLAYED BY THE HOUSE GENERIC**~~ **DONE `2026-08-04i`** | `leadChar`, beside `keysChar`, drawn on its own substream so adding it moved no note. lofi's tune is on a Rhodes or a Wurlitzer in **210 of 300 songs**; the other 90 draw the `sega` rig, where the lead lane resolves to `chipLead` and never reaches `V.lead` at all — a rig is a band. Six genres declare `"synth"` and are byte-identical. Both electric pianos now ask the note which channel it belongs on rather than assuming the keyboard one. **The level was measured and the arithmetic had it backwards**: the bank is scaled UP by 2.4 and the synth stack divided DOWN by 1.68, which says the Rhodes should arrive hotter — it arrives ~2 dB quieter, because an electric piano decays and a held oscillator does not. `LEAD_KBD_TRIM = 1.25`, one number for both, because −1.4 dB against −2.4 dB over two seeds each is not a difference the data separates. `docs/genre-research/the-rhodes.md` | STILL OPEN, and it is now the interesting half: **the comp reaches the Rhodes' hard velocity layer 0 times in 34 969 notes.** The bark is what forte does [corpus:chicagoelectricpiano] and lofi's comp tops out five velocity points under the threshold, out of two numbers set independently — `bark: 0.42` and a gain ceiling of 0.79. Whether a lofi comper plays that hard is a taste question. Also open: **vibraphone and muted guitar**, two of the three instruments the sources name, and this program has neither. |
| *(the row this replaced, kept for the measurement)* | 72% of lofi's lead notes come out of `V.lead`: a triangle, a square and a sawtooth an octave up, through one lowpass, with a vibrato fixed at 5.1 Hz that fades in identically on every note. No sample, no velocity layers, no per-note character. `V.counter = V.lead`, and it is also 100% of synthwave's tune. **Three sources name the lofi lead and none of them names a synth**: "Rhodes piano is the standard choice. Vibraphone works well at lower tempos. A muted guitar played fingerstyle" [corpus:songer]; electric piano is "one of the most iconic instruments in lo-fi", while synthesisers are listed for "soft pads, warm chords, gentle arpeggios" [corpus:clarkaudio]; "Rhodes keyboards and analog synths", with the synth *layered under* a real instrument [corpus:nativeinstruments]. The user's words: "Its stale and lame." `lofi-comp-and-lead.md` §0, §5. | Its own research on what a struck/plucked lead is as SYNTHESIS — every source names the instrument and none describes how to build one, which is stated as a gap in that sheet. Then a voice, and a `leadChar` draw beside `keysChar` so the genre picks its own rather than inheriting the house one. **It moves synthwave too unless the new voice is additive**, so scope it deliberately. |
| ~~**THE TUNE NEVER STOPS**~~ **DONE `2026-08-04j`** | Two table numbers. `theme.breathLast: 7` — the second bar of a phrase may no longer put an onset in its back half, so the tune goes quiet before the phrase comes round again; the pool is FILTERED from the one the genre already declares rather than being a second list, and it spends the same draws either way [Law 3]. `theme.count.hooky: [4,2] → [3,2]` — the hook was the one part of this genre's tune outside the sourced two-to-four a bar, at 4.06. **Measured: notes a bar 2.98 → 2.63, SILENT TIME 38.3% → 41.0%, rests of a beat or longer 39.2% → 47.9%, material B 4.06 → 3.25 a bar.** 300 of 2100 songs moved and every one is lofi. **AND THE FIRST METRIC WAS THE WRONG ONE** — "bars with no note at all" read 5.3% → 6.2% and nearly got the change reported as doing nothing, because a rest in the back half of a bar leaves a note at the front of it. `probe_density.js` now measures silence in TIME. | The rest LENGTH is `[CHOSEN]` and labelled so — no source gives one. |
| *(the row this replaced, kept for the measurement)* | It rests in **1 bar in 19** of the bars it is rostered for (5.3%), against three sources whose whole subject is space: "insert rests between phrases" [corpus:mysticalankar], "leave space between phrases… silence matters more in lo-fi than in almost any other genre" [corpus:songer], "negative space" [corpus:melodigging]. The note COUNT is defensible — material A is 9.0 notes over 4 bars against a sourced two-to-four a bar — but **material B is 16.3, over the ceiling**, and the performed mean is 2.98. What the sources describe is not a rate, it is a shape: phrase, rest, phrase. **This is independent of the row above** — either fault alone produces the complaint. | A rest that is written rather than left over. **No source gives a length or a frequency for it** (`lofi-comp-and-lead.md` §7), so whatever is chosen is `[CHOSEN]` and must be labelled so. Cheapest honest version: a genre-level phrase length, with the tail of the phrase left empty. |
| **`space.wet: 0.16` is identical to the engine's fallback** | The genre declares a reverb level it would have received by default anyway, so the declaration carries no information and nobody can tell whether 0.16 was chosen or inherited. | Either change it deliberately or mark it as agreeing with the default on purpose. |
| **Flutter and hiss are declared and OFF in the other six genres** | Both fields now exist in every genre's `tape` block, and six of them read `[0, 0]`. Two of those are wrong on the face of it: **synthwave is a videotape**, which has both, and bladerunner is a 24-track machine. Turning either on would move every song in that genre. | Not a defect — a decision for whoever is playing it to those genres, with the mechanism already there and one line to change. It was left alone on purpose so a lofi task did not quietly re-voice synthwave. |
| **The crackle's fader is the only crossing on its row** | The `vinyl` row has five blind plates. The reasons are physical (the crackle happens at the stylus, after everything) and measured (feeding it the room moved it 0.00 dB). | Recorded so nobody re-opens them by accident. If a genre ever genuinely wants washed-out surface noise, the plate has to be removed deliberately and the reason in `MATRIX.none` rewritten. |
| ~~**Lofi's tempo sits above the sourced consensus**~~ **DONE `2026-08-04o`** | Declared `[74, 92]`, measured mean **82.5** against a 70–80 common ground — and the relaxation literature says why that window exists: "close to the human resting heart rate… your nervous system synchronises with the rhythm" [corpus:studyclock], "60–70 BPM promotes alpha waves" [corpus:mihata]. | CLOSED: `[70, 84]`, **mean 77.1**, inside the common ground. Moved every lofi song (300/300 snapshot lines, no other genre); re-baselined deliberately. |

## 6c. THE DRUM ENGINE AND THE TR-1000 PANEL — `2026-08-04m` … `04o`

*From the user's reports: the TR-1000 panel "is not a clone of the actual",
the synthwave snare "over rides the bass drum", the kick "has [no] oomph, it is
bearly there", "the hand clap might be the thing i hate", and "why are we
talking about an 808 when we stopped using that many moons ago?" Research:
`docs/genre-research/drum-engine.md`. Measuring arm:
`harness/probe_kickpunch.js`.*

**CLOSED**

| what | what closed it |
|---|---|
| ~~the panel drew ten identical strips~~ | channels 1–4 are double-width with two knob columns, 5–10 single, as the machine is [corpus:soundonsound] |
| ~~knobs capped `CTRL 1/2/3`~~ | they read REVERB / DELAY / FILTER — on the real machine those knobs are *assignable* and the screen names the assignment |
| ~~top-row knobs at three different heights~~ | legends above with a rule, groups top-aligned, one fixed row height; measured, all top dials on one line |
| ~~**seven controls declared, ridden, and drawn on no panel**~~ | BD tune/decay/tone, SD snappy/tone, both hat decays — 68 of 75 reached the glass. Now 75 of 75, checked by deriving the count from the declaration |
| ~~the synthwave snare peaked ABOVE its kick~~ | gate send 0.95 → 0.55, snare reverb 0.52 → 0.34, hold and fall untouched. **+0.3 dB → −2.8 dB under the kick** |
| ~~the engine only ever built 808 circuits~~ | `tr1000.circuit` — the machine is "16 analog voice circuits lifted straight from the previous TR-808 **and 909** designs". **Punch: acid +5.3 → +8.1 dB, synthwave +2.0 → +4.7 dB** |
| ~~the clap's tail was 240 ms~~ | the circuit's is ~100 ms [corpus:KVR]. Per-circuit bands (808 1000 Hz, 909 1140 Hz/Q1.95), decaying retriggers. **acid 64 → 20 ms, plastikman 96 → 20 ms** |

**STILL OPEN**

| what | why it is open | what would close it |
|---|---|---|
| **The kick is still sub-dominant** | 57–64% of its energy under 100 Hz, ~10% in the 100–250 band a laptop reproduces. The 909 circuit and the body layer add ATTACK weight; neither rebalances the spectrum, because the sub's long decay dominates the ratio and the drum bus saturator already fills that band. | Attenuating the sub or raising the tunings — both change what the genres ARE, so both are verdict calls. Measured either way by `probe_kickpunch`. |
| **`punch` is `[CHOSEN]` on every genre** | It ships at the control default 0.55 and no genre declares its own. | A pass once the owner has ruled on the kick. |
| **The narrow strips' three CTRL knobs are small** | 1.16 rem dials. Secondary controls and the screen reads their values, but fiddly on a phone. | Either accept in writing or give the panel a second row at narrow widths. |
| **The right-hand side of the real panel is undrawn** | C1–C6 macros, MORPH, LAYER A/B, transport, pattern keys. | Nothing — deliberate, and the panel declaration says why: they are sequencer controls and this program composes. |
| **Only synthwave declares a gate at all** | So the gated-snare balance work applies to one genre by construction. Not a defect; worth knowing before anyone reads §6c as engine-wide. | A decision per genre on whether a gate belongs. |

## 6d. THE TENSION LOFI'S SOURCES EXPOSE — recorded, not resolved

**The genre's own literature calls repetition a feature**: "semi-predictable,
further minimising distraction", "repetitive and lyric-free enough to stay out
of cognitive focus" [corpus:studyclock]. **§6a of this file exists because the
user found the loop too repetitive** and `Bvar`, the occurrence lanes and the
pass-counting rule of three were built to answer that.

Both are true. The sources' own reconciliation is the "sweet spot": enough
melodic interest to be pleasant, repetitive enough to stay out of focus — which
argues lofi's variation should be **timbral** (a filter opening, a layer
changing dress) rather than **melodic**, and that is exactly what the
`occurrence` motion kind was added for. **Nothing has been changed on the
strength of that reading.** It is here so nobody "fixes" the repetition without
knowing the genre's literature calls it the point. `lofi-production.md` §7b.

## 6e. THE AUTOMATION AND THE FX, UNIT BY UNIT — `2026-08-05a`

*The user: "Can we test the automization and fx of each unit making sure they
work like they should and we are automating things proper."* Two defects were
found by measurement, confirmed independently, and fixed in this build. Both
were **in the scheduler and in one unit's construction, not in any genre's
table** — which is why no genre-level probe had ever seen either.

### CLOSED

| what was wrong | measured before | measured after |
|---|---|---|
| **The barberpole went permanently silent** partway into every playback. Its window rode each notch's **Q**, and `setSpace` rode the window's sine leg and its DC-lift leg with the *same* number, so Q swung symmetrically about zero. Chrome installs **all-zero filter coefficients at Q = 0**, so a notch that merely touches zero mutes the cascade — and six notches offset by a sixth of a cycle tile the cycle with no gap. Rebuilt as six `peaking` filters whose **cut gain in dB** is windowed by a raised cosine read off the sweep, which is what the sources say and what the panel had been drawing all along. `barberpole.md` §7 | the return collapses and never recovers — see the backlog | holds for the whole render |
| **The hard steps in the motion plan mostly never reached the parameter.** `rideBus` wrote its curve one point per **beat**, four times coarser than the plan's own sixteenth, so a `throw` placed at `at: 0.8` or `0.875` lived entirely between two grid points; and the test for "is this a step" read the *fader-law factor* (1 on nearly every lane) instead of the lane's depth, giving a flat threshold of 0.35 against declared throws of 0.10–0.34. Edge lanes are now written on the plan's own grid, and "does it jump" is asked of the plan directly instead of by size. | **0 of 1227** planned steps arrived, across 5 genres and 14 lanes; snaps landed **57.7 ms early** (exactly half a sixteenth — the bisection was finding `motionAt`'s rounding boundary, not the bar line) | **1227 of 1227**, 0 ms rise, 0 ms early, on the line |
| **`rideBus` read three callers' bases in the wrong units.** It clamps to `CONTROL[key]` and normalises the motion against the control's default, and three callers hand it the knob value already multiplied: the flanger's depth in seconds (0.0040×), the DP/4's amounts per algorithm, the pole's window (5×). The multiplier is now passed separately and applied last. **One real casualty and two near-misses** — see the correction below the table. | `barber.depth` written as **exactly 1.000 for the whole song**, both legs, on synthwave | swings **−19.5 … −12.7 dB**; flanger and DP/4 unchanged to the last digit |

**CORRECTION, same build, made after the commit that claimed otherwise.** The
first write-up of the third row said the flanger "delivered 0.8 % of its
declared motion". **It did not, and neither did the DP/4.** Measured on both
builds: `flange.depth` on plastikman writes 0.001907 … 0.002660 s before the
change and 0.001907 … 0.002660 s after — identical, and identical for a
reason. The fader-law factor is `base/def`; when the base is `scale × knob`
that factor is `scale × knob / def`, so `scale·knob + (scale·knob/def)·m` and
`scale·(knob + (knob/def)·m)` are the same number. The multiply distributes
straight through the one place it looked dangerous. What was genuinely broken
is only the **clamp**, which was being applied in seconds and in decibels to a
range written in knob units — never binding on the flanger (0.002 s is nowhere
near the control's max of 1) and binding on every sample of the pole, whose
scale is greater than one. The fix is right; the scope of it was overstated by
two of three, and that overstatement was in a pushed commit message.

### STILL OPEN, from the same audit — **verified, not yet decided**

- **Apex lanes deliver 40–88 % of their declared swing.** `motionAt`'s comment
  says "depth is the swing from arc 0 to arc 1", and `form.arc` never reaches
  0 — so every genre with an apex lane moves less than it says: dkc 40 %,
  lofi 50 %, jungle 63 %, acid 67 %, synthwave 71 %, bladerunner 77 %,
  plastikman 88 %. **A decision, not a bug**: either make the comment true, or
  normalise the move so the declared swing is delivered. The second changes
  every genre that declares one and needs a deliberate re-baseline.

### RAISED BY THE AUDIT AND **NOT INDEPENDENTLY VERIFIED**

Their verifying agents never ran. Recorded so they are not lost and marked so
nobody builds on them:

- two of the four LFO shapes (`ramp`, `fall`) are used by no genre;
- `occurrence` sits at step 0 for about half of every record, and lofi reaches
  only 63 % of its declared cap;
- throws land mid-phrase 64–72 % of the time in four genres — the phrase
  counter is absolute rather than section-relative;
- `gesture` entry edges are undocumented discontinuities (144 of 192 moves;
  jungle's build reportedly opens with an instant −19.0 dB step);
- snap windows land mid-section 22 % (plastikman) / 45 % (jungle) of the time.

## 7. UI

- ~~**A PAD CAN BE PERFECTLY WIRED AND STILL DO NOTHING**~~ **CLOSED
  `2026-08-05d` — THE HAND IS THE END OF THE LINE.** The user ruled on it in
  one sentence: *"If I turn a knob it should always work for me no matter what
  the genre is. The user is the end of the line."* Fifteen genre/unit pairs
  had no input at all, so every knob on those units was inaudible — the
  flanger, the DP/4 and the barberpole, five genres each. A hand on any
  control of a return unit now OPENS that unit's inputs on a song that was not
  already feeding it: hand-only (a song nobody touched is unchanged to the
  sample, measured below), reversible (release the trim and it goes back), and
  derived (nothing names a unit or a genre). **15 → 0.** The measurement that
  found it is kept below.

  Measured `2026-08-05` with `harness/probe_pads.js`, the pad's whole
  travel as a difference against the mix, best of three windows across the
  record:

  | | lofi | synthwave | dkc | bladerunner | acid | plastikman | jungle |
  |---|---|---|---|---|---|---|---|
  | **KORG · KAOSS** (echo) | −28.7 | −26.6 | −19.7 | −16.7 | −18.9 | −15.4 | −33.9 |
  | **YAMAHA · SPX90** (flanger) | **−81.1** | −14.2 | **−99.3** | **−92.1** | **−99.7** | −2.1 | −10.1 |

  The echo pad reaches the sound on all seven. The flanger pad reaches it on
  the three genres that feed the flanger and is **silent to the float floor on
  the other four** — which is correct behaviour (the unit is not in those
  records' signal path) presented as a working control. You put a finger on it,
  the cross moves, the value changes, and nothing happens. That is the "a knob
  that does nothing is a lie" rule one level up: the knob works, its unit is
  not connected on this song.

  After the rule, re-measured with the same probe: **7 of 7 on both pads.**

  I had written this row up as "correct behaviour presented as a working
  control" and proposed greying the pad out. The user rejected that reading
  outright, and was right to: a control that is drawn and turnable and does
  nothing is the defect this file already has a rule about, and which side of
  the signal path the reason sits on does not change that.

  **Still open, and smaller: the dim dot on the SPX90 can only ever appear on
  plastikman** — the only genre whose song moves `flange.rate`/`flange.depth`.
  On the other six that pad shows one mark where the machine shows two. The
  hand rule does not touch this; it is about what the SONG moves, not what the
  hand can reach.

- ~~**Nothing on this page shows the NOTES**~~ **DONE `2026-08-04h` — THE ROLL.**
  Every display in the program showed what the machines were doing; none showed
  what the song was. It draws through `midiKeyFor`, the same function the .mid
  export and the live port use, so the count on the glass is the count in the
  exported file — which is the check `mk2_ui.js` now makes, per role, on a
  genre with an ostinato and a second keyboard, because those are the two roles
  this project has actually lost on export. **It is NOT the picture
  `mk2_roll.js` prints and that is the point**: that shows the material, this
  shows the performance, so the groove displacement and the arc thinner are
  both visible for the first time.
- **The roll shows one song and cannot compare two.** The interesting question
  about six unjudged builds is what CHANGED, and the display answers "what is
  there". A ghost layer of another seed or another build would answer it.
- **The roll has no zoom and no scroll.** A 304-bar jungle song is squeezed into
  the same width as a 44-bar lofi one, so at that length a bar is three pixels
  and only the shape survives. Fine for reading an arrangement, useless for
  reading a phrase.
- **The field does not name the section's stage on the tube** — now that a
  stage is a thing, showing which one is running is small and obvious.
- **`probe_wiring`'s table belongs on screen**, not only in a terminal.

---

## Out of key, blended harmony tables — 2 of 240 pairs (2026-08-20)

Not a solo-genre failure: **0 of 160** solo records throw across five genres and
32 seeds. Both survivors are blends, and both are the harmony check refusing a
note:

- `dungeonsynth:70 + boxcarsynth:30` seed 3 — `in C: lead 72 bar 6`
- `boxcarsynth:50 + fantasysynth:50` seed 6 — `in Bdev: keys2 54 bar 7`

The first predates fantasy synth. The second appeared when fantasy synth's
section lengths changed and moved which bar the blend lands on — a reshuffle
exposing the same latent defect, not a new one in kind.

The shape to look for: a blend takes one genre's mode pool and the other's
registers/progressions, and a voice ends up on a scale degree the merged table
does not actually contain. The drone's own instance of this was fixed at
`2026-08-20b` (a stacked fifth folded into the mode; see
`docs/genre-research/fantasy-synth.md` §10) and the same treatment — *ask the
mode before writing the note, do not assume the interval* — is probably the
answer for `lead` and `keys2`.

## Fantasy synth: the monster shares the hero's matrix row

`MIX_ROLE_BUS.counter` is `"lead"`. The chase at the fight is two soloists
trading, and `leadFlange` / `leadDP4` colour **both** of them. A `counter` row of
its own is a matrix change (a row, five blind-plate decisions, and the genres
that want it naming `counter` in `space.feeds`), not a table one — which is why
the automation build stated the limitation instead of faking it with a lane that
cannot do what its name says.

## The atmosphere bed's distance cannot glide inside one bed (2026-08-20)

`atmos.far` and `atmos.air` are `gesture` controls — read once through `P(...)`
when the event starts. A bed is one long event, so the fx planner's `space` and
`air` curves are sampled at the bed's onset and held for its whole length.

Since beds are now dealt per movement, that is one distance per movement, which
is a real improvement on the fixed number it replaced — but it is not what a
continuous curve would give. Making it glide means riding the atmos voice's own
gain and filter nodes the way `rideBus` rides a bus control, which is a graph
change rather than a table one.

## The fx planner's readings are per SECTION, not per bar

`space`, `gaps`, `air` and `weight` are measured off the material a section
plays, so they are flat inside a section and glided across the seam. A section
whose second half is much busier than its first gets one number for both. Bar-
level measurement is possible — the materials are indexed by bar — and would
cost a loop rather than a mechanism.

## `snap` is still undeclared by any genre

The planner emits its cut as a rectangle folded into the curve rather than as a
`snap` spec, because one mechanism was cheaper than two. `snap` therefore still
has no user. Either give it one or fold it into the planner and delete it — a
kind nobody declares is the same defect as a knob nobody rides.

## §0af — the four parent genres shipped SILENT for one build (2026-08-21, CLOSED)

Commit `a65d843` ("the pedalboard gets its glass") put

```js
if(every.length || anyPed() || handOn("comp") || handOn("oct") || handOn("phase"))
```

sixty lines **above** `const handOn = k => …`. A `const` read before its own
declaration is a temporal dead zone, not a hoisted function, so that line threw
`Cannot access 'handOn' before initialization` — and `setSpace` died with it.

MEASURED, seed 1, a 6-second excerpt from each genre:

```
lofi          THREW      synthwave     THREW
dungeonsynth  THREW      fantasysynth  THREW
doomsludge    ok
```

Doom and sludge alone survived because `every.length` is truthy there and the
guard short-circuits before the third term is ever touched — so the genre I was
working on was the one genre that could not show me the bug, and I reported
"5 seeds × 5 genres, no throws" on the strength of a check that never reached
the render. **A check that only exercises the genre you are working on is not a
check.** Fixed by moving the hand-pedal declarations above their first reader;
the render battery now covers all five.

## §0ag — the pedalboard is on the matrix mixer (2026-08-21, CLOSED)

[owner: *"And all FX need to be added to the matrix mixer"*]

The board was patched by `space.fuzz.rows` — a list of names, which is the
binary model `routeLevel`'s own comment spends forty lines demolishing. It is a
column now: `PEDALS`, whose crossing is the board's **insert depth** on that row
(`wet = depth`, `dry = 1 - depth`, both driven from one ConstantSource so they
cannot disagree). Its base is read off the board's own `rows`, so there is no
second table to go stale, and `pedalFeeds` exists only to say a *level*.

MEASURED, doom leg, seed 1, bass + keys:

```
crossing at 1 (the genre)   rms 9.332e-2
crossing at 0.4             rms 3.622e-2
crossing at 0 (bypassed)    rms 3.297e-2      -9.03 dB
```

And it joined the automated set by itself, which is the point of the grid:
`axisMod` walks every column, so seed 1's doom record now rides

```
matrix.bassPedals   0.562 … 0.989   mean 0.811
matrix.keysPedals   0.581 … 0.977   mean 0.811
matrix.leadPedals   0.665 … 1.000   mean 0.848
```

— the fuzz breathing on 19- and 31-bar cycles rather than sitting at one depth
for twenty minutes. Notes unchanged in all five genres; lofi and dungeon synth
null at 1 LSB, and synthwave's 25 LSB is its own repeat-render floor measured
against a control in the same build (§0ad).

STILL OPEN, stated rather than implied: the crossing is an insert depth, so a
row with no board draws a knob with nothing to bypass. A hand opening
`<bus>Pedals` on the matrix panel now arms a board on that bus — but only if a
pedal is switched on, because the crossing is the cable and the four pedal
panels are the footswitches.

## §0ah — the fight act renders under realtime, and it is not the pedals (2026-08-21)

MEASURED, doomsludge seed 1, nine-second offline renders at four points in the
record, on the build **before** this session's pedal work and after it:

```
                         pre-session      now
  t= 270  (doom)          1.28x           1.14x
  t= 428  (sludge)        1.31x           1.18x
  t= 655  (the fight)     0.80x           0.61x
  t= 942  (walk home)     1.16x           1.01x
```

**The fight act was already under realtime before a single pedal was added.**
This session cost it a further 0.19x, and the pedals are a fifth of that act's
total: removing every meathead unit saves 1.3 s of 12.4, the chainsaw 0.8, the
divider 0.8, the sag nothing above the noise. Trimming row lists was tried and
moved less than the run-to-run spread.

So four fifths of the cost is the arrangement — six roles, a dense kit at
118 bpm, the FDN room and the rack worklet — and that is a separate job from
the board. Candidates, none measured yet: the per-instrument channel strips
`ensureChannels` builds (a fader, three biquads and an analyser each), the
drum kit's own sub-mixer, and the fact that `renderWav` builds every node for
the whole excerpt up front, which the harness's own note says is super-linear
in length.

**One caveat before anyone optimises on these numbers**: an offline render is
not live playback. `renderWav` holds every node for every quantum of the whole
excerpt; the live graph schedules voices as they arrive. The offline figure is
the honest worst case and the right thing to watch, but a 0.61x here is not
proof the page stutters — that has to be measured live, and has not been.

> **MEASURED LIVE 2026-08-22, and this caveat is now answered: §0al.** The page
> does stutter, in exactly one act. The guesses in the paragraph above were
> wrong in their shape — the cost is not one expensive subsystem, it is nine
> hundred cheap nodes plus one part.

## §0ai — a backtick in a worklet comment kills the page silently (2026-08-21, GUARDED)

`RACK_DSP` and `ROOM_FDN` are template literals holding AudioWorklet source. A
bare backtick written in a comment inside one ends the literal, and the file
then fails to parse with an error naming whatever identifier follows:

```
SyntaxError: Unexpected identifier 'recov'
```

Hit twice in one hour while writing the sag. The render battery does catch it —
by hanging for three minutes waiting on a `window.MK2` that never arrives.
`harness/mk2_syntax.js` now says the same thing in a second, with a line
number and no browser, and also counts unescaped backticks inside both worklet
strings by name. The room's own comment records the same class of trap one
layer along: `btoa` threw on a box-drawing character in a worklet comment, the
catch swallowed it, and the reverb silently fell back to a convolver.

## §0aj — `longLoop` is dead for the part it was written for (2026-08-21)

`form.longLoop: { lead: 2, keys2: 2 }` says those two parts come round every
eight bars instead of four, and its comment quotes the source it came from:
*"We're going to make the choir part twice as long as the harp part."*

**It does nothing for `keys2`.** The swap is guarded — correctly — on the
variant being a different array (*"A and Avar share their bass and their comp
on purpose, and swapping identity for identity would be a line of code
pretending to be movement"*), and `Avar`'s keys2 **is** `A`'s keys2. So the
guard declines every time.

MEASURED, fantasy synth seed 1: the second keyboard plays **5 distinct bars in
89**, and is identical to the bar four back **100% of the time** at lag 4, 8
and 16. A four-bar cell, twenty-two times, unvaried, in a genre that declares a
table saying it should not be.

The rule-of-three work this build routes around it — a part with no usable
variant lays out for the second half of every third pass instead — but that is
the first rung of the ladder answering a demand the second rung should have
taken. The real fix is stage 3: `Avar` must compose a genuinely different
`keys2` (and the same question should be asked of every material/part pair —
nothing has audited which of them are identity).

## §0ak — the bass is masked, not quiet (2026-08-21, PARTLY FIXED)

[owner: *"our bass is most inaudible"*]

MEASURED: deleting every bass event changed the record by 0.05 / 0.04 / 0.01 dB
in the three heavy acts. Three levers were tried:

| lever | what it did |
|---|---|
| `roleGain` 0.22 → 0.55 | bass alone rms 0.0224 → 0.0604 (+8.6 dB) |
| octave pedal | +3 points of distribution — and found a real bug: the rectifier's coupling cap was a **120 Hz** high-pass, which deletes the 69 Hz octave of a 34.6 Hz bass. Fixed to 40 Hz, where a DC blocker belongs. |
| register [24,41] → [31,48] | up a fifth, G1–C3 |

**And it is still only worth 0.2 dB in its own 40–80 Hz band.** That is the
finding: the band belongs to the kick (`drumDrive: 1.75`, `roleGain.drums:
1.40`) and the drone (`[21,31]`, 27–49 Hz), and a part cannot be made audible
by raising it inside a slot two louder things already own.

What is still owed is a frequency-slot decision, not another fader:
- carve the kick where the bass fundamental sits, or the reverse;
- give the bass a presence band (700 Hz–1.5 kHz) so it is heard through its
  growl rather than its fundamental, which is how bass is heard in any dense
  mix. The per-role EQ hook for that does not exist — `g.grp[role]` has three
  biquads and no genre table writes them.
- or move the drone off the bass's octave.

Named here rather than left as "improved a bit".

## §0al — the stutter, measured live at last, and what it actually is (2026-08-22)

[owner: *"There was an issue with the most recent effects units the program is
stuttering upon playback"*, then *"Disconnect the last fx unit"*]

§0ah ended by saying its own 0.61x was not proof the page stutters and that
someone had to measure it live. `harness/mk2_cost.js --live` does that: it
drives the real play button, starts the record at a named second and watches the
audio clock against the wall clock. A context that keeps up reads 1.000; one
that cannot reads short, and the shortfall IS the dropout.

```
  lofi          t= 30    1.000        every genre, and three of doomsludge's
  synthwave     t= 60    1.000        four acts, keep up exactly
  dungeonsynth  t=120    1.001
  doomsludge    t=270    1.002   doom
  doomsludge    t=428    1.002   sludge
  doomsludge    t=655    0.886   THE FIGHT   <-- the stutter, and only here
  doomsludge    t=942    1.004   walk home
```

**The stutter is one act of one genre.** Roughly one playback second in eight
is not rendered in the fight act, which is what "stuttering" describes.

### AND THE FIRST TWO ATTEMPTS TO ATTRIBUTE IT WERE NOISE

Wall-clock timing on this container swings ±25% run to run. It produced a build
comparison that was monotone and convincing and, three runs later, was not; and
a role ablation in which **removing the drums made the record slower**, which is
not a thing that can happen. Anything measured that way — including any
before/after in this file — is a number wearing a result's clothes.

So `mk2_cost.js` counts **CPU-seconds per audio-second** off `/proc`, summed
over the whole chrome process tree. Another process competing for a core changes
how LONG a render takes and not how MUCH of a core it burns. Stable to ~3%.
1.0 is one whole core, and Web Audio renders a graph on one thread.

### WHAT THE FIGHT ACT IS MADE OF

```
  doom       t=270   1.19          the four acts
  sludge     t=428   1.15
  THE FIGHT  t=655   1.89
  walk home  t=942   1.17
  lofi       t= 30   1.19
```

**Read the walk home again: ten events in ten seconds, and it costs what lofi's
hundred and thirty-two costs.** About **1.15 is a FLOOR paid before a note
sounds** — strips, buses, returns, the matrix, two worklets: some nine hundred
nodes standing still. That is 60% of the fight act and 97% of the walk home,
and **every genre pays it**.

Nothing in the floor is worth more than a tenth of it. Substituting a plain gain
for each node type in turn: 38 meter taps 6%, the two convolvers 9%, the four
compressors 6%, the waveshapers 7%. **It is not one expensive thing; it is nine
hundred cheap ones**, so there is no single fix in there — only fewer nodes.

The other 40% is **one part**. Dropping each role from the fight:

```
  no keys        1.23     <- the entire variable cost, in one part
  no drums       2.16     (baseline 2.18)
  no bass        2.34
  no ostinato    2.03
  no keys2       2.08
```

`keys` plays four-note chords on `horns` five to seven times a bar there, and
`V.horns` builds **six sawtooth oscillators per note** — one strike of that
chord is twenty-four oscillators, and they overlap. The printout shows it plainly
at bar 220: `C#3 G#3 C#4 G#4` struck at steps 0, 6, 8, 11 and 12. Musically it
is a power chord tremolo and it is right for the act. It is also the fight act.

### WHAT THE PEDALS ACTUALLY COST, AND WHAT WAS DONE

The owner named the effects units, and they are a real cost but a small one:
every pedal switched off is ~0.17 of 2.18, about **8%**. The **sag alone is
5.3%** (1.883 -> 1.778, consistent across three paired runs).

**The sag was disconnected** at the owner's instruction — `g.SAG_ON_BOARD`, one
flag in `makeBoard` — and **is now back on, fixed** (§0am). It was disconnected
and never deleted: `makeSag`, `setSag`,
the `mk2-sag` worklet, the rack panel and all three `sag:` blocks in the
doomsludge table are still here and still correct. Both `mk2-sag` worklet nodes
are gone from the graph; lofi, dungeon synth and fantasy synth null at 1-3 LSB
and synthwave's 44 is exactly its own same-build repeat-render floor, measured
in the same run (its floor is bigger than the 25 LSB previously quoted).

### STILL OWED, AND NAMED SO IT IS NOT MISTAKEN FOR DONE

**The fight act still does not play.** 1.78 cpu-s per audio-second where one
thread has 1.0. Taking the sag off recovered 5.3% of a gap that needs about 45%.
The two honest routes, neither of them this session's to choose:

1. **Fewer nodes in the floor.** Nine hundred standing still, no single one
   dominant. Real, structural, helps every genre and every act.
2. **The fight act's `keys` part.** Twenty-four oscillators a strike is the
   whole variable cost. Thinning it — fewer flankers at high `section`, or a
   narrower chord — is a MUSICAL decision and belongs to the owner.

One thing that is NOT a route, and was tried: `V.horns` stops its oscillators
1.4 s after the note while the amp envelope has finished at 0.22 s. Cutting the
tail to 0.35 s measured within the noise. It is still a waste of a second of six
oscillators and worth fixing on its own merits; it is not the stutter.

## §0am — the sag was one function call, not a circuit (2026-08-22, FIXED)

[owner: *"I just listened to seed one and had no issues ... I think the problem
was the last FX unit. Can we try and correct it."*]

The owner was right about the unit and it did not have to be given up. The cost
was never the pedal being in the signal path — it was `Math.tanh`, called once
per sample.

**MEASURED FIRST, so the fix aimed at something.** doomsludge seed 1, the fight
act, ten-second window, three runs each, CPU-seconds per audio-second:

```
  sag off the board          1.751
  sag on, as first written   1.874      <- the reported stutter
  sag on, LOOP EMPTIED       1.697      <- THE NODE ITSELF IS FREE
```

An AudioWorkletNode spliced into the chain and doing nothing costs nothing
measurable. All of it was inside the loop.

**THE LOOP, TIMED ON ITS OWN** — twenty seconds of audio through one sag, nine
runs, medians, no browser and no graph, so the ratio is the unit's ratio:

```
                      ms     speed    vs the original: worst    average
  as first written   42.1     1.0x
  tanh from a table  15.9     2.6x         -98.8 dB          -130.5 dB
  table + rail/8     25.6     1.6x         -39.5 dB           -65.1 dB
  table + rail/16    18.3     2.3x         -32.9 dB           -58.5 dB
  table + rail/32    15.1     2.8x         -26.7 dB           -52.5 dB
```

**The obvious clever idea was the wrong one and is recorded so nobody tries it
twice.** Recomputing the supply rail per block instead of per sample sounds like
the saving — a rail falls on 11 ms, so five hundred answers a second is absurd —
but it was SLOWER than the table alone (advancing a rail across a block needs a
`pow` per block) and far less faithful (the envelope stops seeing transients).
The cheap thing and the accurate thing were the same thing.

**So the table is the whole fix**, plus one free thing: the sag sits on the bass
and the lead, and in the fight act the lead plays nothing at all while the bass
plays nineteen notes in twenty seconds — but a worklet is called every quantum
whether or not sound is passing through it. A block of silence with the follower
already down now returns the rail's resting value directly instead of computing
it 128 times.

### AND THE FIDELITY QUESTION HAS A FLOOR NOBODY HAD MEASURED

The rebuilt sag renders the fight act **-73.5 dB RMS** from the original, which
looked like a real change until the obvious control was run:

```
  doomsludge, the SAME build rendered twice   -72.8 dB RMS, worst 1064 LSB
  original sag vs rebuilt sag                 -73.5 dB RMS, worst 1059 LSB
```

**The difference is smaller than what the record makes against itself.** The FDN
room's feedback makes doomsludge far noisier render-to-render than the LSB-level
floors the other genres have — this is the number to quote for doomsludge from
now on, the way synthwave's is 44 LSB (also measured this session, and also
bigger than the 25 previously quoted).

Other genres, against the build before any of this: lofi 2 LSB, dungeon synth 1,
fantasy synth 1, synthwave 23 — all inside their floors. The one test: 10
records, 0 threw.

**Still true, and unchanged by this**: §0al's fight act is still the fight act.
This gives back a few per cent of a gap that needs about 45%, and the two routes
named there — fewer nodes in the floor, and the `keys` part's twenty-four
oscillators a strike — are still where the stutter actually lives.

## §0an — a short record lost its lead for the whole fight (2026-08-22, FIXED)

[owner: *"I shortnd the song to 4 mins, and the lead just cut out and stop
playing half way through the fight."*]

Reproduced exactly, and it was structural rather than unlucky.

`form.feature` is the solos-and-duels rotation. Its own comment says the
rotation is *"a shape the leg walks through rather than a per-section coin"* —
and **a leg of one section walks nothing. It stops on frame one.** doomsludge's
`"the fight"` list opens `{ solo: "keys" }`, so in **every** short record, at
**every** seed, the fight was a keys solo and the lead was not in it at all.

MEASURED, doomsludge seed 1 asked for four minutes: seven sections, one of them
the fight. The lead is absent from it AND from the bridge in front of it — 49
seconds of a 245-second record, ending on the climax. Exactly what was reported.

**The full-length record hides it** because its fight has nine sections and
walks the shape properly. This is why turning the length dial down changed the
music's character and not just its length, which is a thing a length dial must
never do.

### THE FIX, AND IT IS ABOUT THE OUTCOME AND NOT THE LENGTH

A feature may not keep a part out of a whole leg. If the rotation would drop the
same part in every section this leg has, that part comes back — **in the leg's
last section**, so a two-section leg still opens on its solo and the missing
part walks in for the close. It is taken from `allowed` and not from `active`,
so it outranks the `rest` coin in that one section; a guarantee about the leg
that any per-section draw can undo is not a guarantee.

MEASURED over 21 records a length, counting those with **no lead anywhere in the
fight**:

```
             before   feature-guard   +outranks rest
   2:00        10           1               0
   3:00        12           3               2
   4:00        12           2               0
   5:00        11           2               2
   6:00         9           3               2
   full         0           0               0
```

**Roughly half of every short record was affected.** Blast radius of the fix:
60 records (5 genres x 3 seeds x 4 lengths), **4 changed — all doomsludge, all
shortened, and no full-length record in any genre.** Bar counts unchanged, so
the form is untouched and only who-plays moved. Only doomsludge declares
`feature`, so the other four genres are bit-identical by construction [Law 3].
The one test: 10 records, 0 threw.

### STILL OWED

**The residual 2-in-21 is a different mechanism and was left alone deliberately.**
Those are legs the rotation never empties — it hands them a tutti — where the
`rest` coin then happens to sit the lead out of every section anyway. The guard
cannot see it: the guard reads a table, `rest` is a draw made section by
section. Catching it wants the leg checked **after** its sections are laid,
which means `form.map` building the sections in two passes rather than one — not
a second copy of the rest rule living next to the feature, which is the bug this
file has shipped three times.

**And the full-length record has its own hole, from the same pair of mechanisms
compounding.** doomsludge seed 1 at full length: sections at bars 204, 220, 236
and 252 — **four consecutive, about 130 seconds** — have no lead, right across
the opening of the fight. Three are the rotation (`solo keys`, `duel keys+bass`,
`solo bass`); the fourth is a tutti the rest coin emptied. The fix above does
not touch it, because no part is missing from the *whole* leg there. The rule
that would catch it is the one this file already believes in for section
functions — state, repeat, **change on the third** — applied to absence: no part
goes missing for three sections running. That changes every genre's arrangement,
so it is the owner's call and not a thing to slip in.

## §0ao — doomsludge seed 8 throws at every length (2026-08-22, FIXED)

Found while sweeping 24 seeds x 6 lengths for §0an, and **it is not new** — it
throws identically on the build before that work:

```
  Error: collision in A at 0:0:52 — drone lands on keys (bar 0, step 0, pitch 52)
```

doomsludge, seed 8, at 2:00, 3:00, 4:00, 5:00, 6:00 and full length — every
length, so it is the material and not the form. 6 of 144 doomsludge records in
that sweep. The collision guard is doing its job and saying so loudly; what it
is catching is the drone and the keys being written the same note in the same
cell of material A. Not investigated further this session.

## §0ap — the three holes, closed (2026-08-22, FIXED)

[owner: *"Fix the issues"*]

Three things were named at the end of §0an and §0ao. All three are done.

### 1. THE REST COIN AND THE ROTATION COMPOUNDED, AND NOTHING WATCHED THE OUTCOME

The feature guard added in §0an reads the **rotation**, which is a table. It
cannot see `rest`, which is a coin drawn section by section — so the two made
holes neither of them chose. doomsludge seed 1 at full length had **four
consecutive sections, bars 204–268, about 130 seconds, with no lead at all**,
across the opening of the fight: three from the rotation, the fourth a tutti the
rest coin emptied.

So there is now a check on the **outcome**, made where the outcome finally
exists — after arrival, after rest, after the feature. Two rules, both of them
rules this file already held elsewhere:

- **Three in a row.** *State, repeat, change on the third* is the law this
  program already applies to section functions. A part may sit out twice; the
  third time it comes back.
- **Not for a whole leg.** At a leg's last section, a part the leg's own roles
  list and that has not been heard once in it comes back.

**It only ever rescues from `allowed`, and that is what makes it safe.** The
deliberate long absences here are *declared*, not drawn — doomsludge's
`the long way home` lists no drums and no bass, so neither is ever in `allowed`
there and neither can be dragged back in. The record's last section is left to
`thinTo`, because the ending outranks a rule about the middle.

MEASURED, 400 records (5 genres x 16 seeds x 5 lengths), counting a part that
**had been playing** and then went quiet:

```
                                              before   after
  goes quiet for 3+ sections                    325      0
  longest such run                                8      2
  lead absent from the WHOLE fight, per length   see §0an   0 at every length
```

### 2. THE GROUND WAS LANDING ON THE COMP — TWO BUGS, NOT ONE

`collision in A at 0:0:52 — drone lands on keys` took **5 of 60 doomsludge
seeds**, at every length. Two faults compounding:

**A stack folding onto itself.** The drone's stack is folded into its own band
by `intoBand`, and a fold can put two different voices on ONE pitch — a root at
45 and its octave at 57 both come back as 33 in a band that stops below 45. The
lane emitted `[33, 40, 33]`. That is not two voices, it is one voice written
twice, and it forced the collision walk to move a note that was only there by
accident.

**`clearAgainst` mutating notes shared between materials, which is the real
one.** `droneA` is the ground of A, Avar, Adev, Aseq *and* T, and `droneB` is
the same object again whenever a record has no new chorus. The walk moved notes
**in place**, so clearing one material moved the note in all of them and the
material that went first was silently un-cleared by the one that went last —
and nothing re-checked it. MEASURED: A's ground was cleared to `[45, 40]` and
came out of the loop as `[45, 52]`, because a later material found 40 taken and
walked it up to 52, straight onto A's comp — the one pitch A had just been
cleared of.

Each material now clears its **own copy**. A ground shared by five materials
sits under five different sets of parts and has no business being one object
once it starts negotiating with them.

MEASURED: **600 records (5 genres x 120 seeds), 10 threw before, 2 after** — and
both survivors are a different fault entirely (§0aq).

### BLAST RADIUS

60 records (5 genres x 3 seeds x 4 lengths): **33 changed**. lofi and synthwave
are untouched at every length and seed tested; doomsludge, dungeon synth and
fantasy synth moved. That is the arrangement rules doing what was asked of them,
and it is the largest deliberate change to what these records play since the
rule-of-three work. The one test: 10 records, 0 threw.

## §0aq — the last two throws are a harmony fault, not an arrangement one (2026-08-22)

After §0ap, **2 records in 600 still throw**, and both are the same law:

```
  lofi seed 17          out of key, not in the chord, and does not resolve
                        into the next one, in Bdev: keys2 82 bar 3
  dungeonsynth seed 114 ... in Alift: counter 64 bar 0
```

Both are **pre-existing** — identical on the build before this session's work.

**The obvious explanation is wrong and was checked.** The law's own comment says
it is the check that catches *"a part left behind"* by a key change, and `Alift`
is the key-lift material — but `counterAl` **is** derived against `liftChords`
(`deriveCounter(themeAl.notes, resAl, "counterA", liftChords, keysAl)`), so the
counter does come with the lift. The bad note is being produced *inside* the
derivation, not inherited from the old key. `Bdev`'s keys2 is the same shape one
material along.

Not investigated further. It is 0.33% of records, it fails loudly rather than
silently, and it wants someone reading `deriveCounter` and the `Bdev` derivation
with the printout open — which is a different session's work from this one.

## §0ar — the kick and the riff were two parts that met by accident (2026-08-22, FIXED song-wide)

[owner: *"I think your wrong and you need to use the web to back yourself up.
The drums have to adhear to what the rest of the song is doing and vis versa
its not just do what ever."*]

The owner was right and my previous plan was wrong. I had proposed giving the
drums a small VOCABULARY of bars to reuse — which still treats the kit as an
independent part doing its own independent thing, only less randomly.

**THE SOURCES SAY IT IS A RELATIONSHIP.** Mathcore: *"kicks are orchestrated to
mirror or contradict guitar groupings"* [corpus:lyricassistant]. Metal
generally: *"the kick often accentuates key rhythmic parts of the guitar"*
[corpus:ujam] and *"the kick and snare pattern ... closely follows the main
riff, which is played on the guitar and doubled by the bass"*
[corpus:wikipedia heavy metal drumming].

### THE MEASUREMENT THAT SETTLED IT

A bar has 16 slots. Slots 0, 4, 8 and 12 are the beats and every part likes
those anyway, so agreement there proves nothing. **The test is the
syncopations**: when the riff plays off the beat, does the kick catch it?

```
  genre          off-beat kicks landing on a riff note   by chance   ratio
  lofi                        90%                           51%      1.76x
  synthwave                   60%                           43%      1.41x
  doomsludge                  28%                           22%      1.26x
  dungeonsynth                 1%                            5%      0.19x
```

**1.0x is no relationship at all.** Doom sludge sat at 1.26x — the riff
syncopated one way, the kick syncopated another, and they met by accident.
Dungeon synth's kick actively *avoided* the riff.

### AND A CORRECTION TO §0al's COMPANION RESEARCH

The research doc said Televators' drums repeat and ours do not. **The Televators
MIDI's "Drumkit" track is hi-hat and ride only — no kick, no snare** — so it
cannot answer this question at all and should not have been quoted for it. What
it does show is a small vocabulary: 15 distinct bars over 59, each used ~4
times, and *no bar ever repeated twice in a row*. Drums change constantly in
that record too. That was the owner's point and the measurement agrees with him.

### WHAT WAS BUILT

`kit.followRiff` — how many of the riff's own accents the kick doubles in a bar.
The kit keeps its downbeat whatever the riff does, because that is the kit's and
not the guitar's. Declared so far on **the fight only**, at 6, which is what
that leg's comp actually strikes (bar 220: keys on steps 0, 6, 8, 11, 12).

It overrides `kickPattern` there deliberately. HARDCORE_FEET is a good foot
pattern chosen without reference to the guitar, and a leg whose whole character
is the band hitting together does not want two good independent parts.

**AND IT FIXES THE REPETITION COMPLAINT FOR FREE**, which is why it is this and
not a vocabulary of drum bars: if the riff repeats, the kick repeats with it,
because they are the same pattern.

MEASURED after: doomsludge **28% -> 67%, 1.26x -> 3.04x** across the whole
record, with the declaration on one leg of four. In the printout at bar 204:

```
  keys  |*--**-*-*--**--.|   riff accents at 0, 3, 4, 6, 8, 11, 12
  kick  |x..xx.x.x..x....|   kick        at 0, 3, 4, 6, 8, 11
```

### THE MOVE THAT MADE IT POSSIBLE, AND THE PROOF IT WAS SAFE

All five `buildDrums` calls used to stand hundreds of lines ABOVE `keysA`. A kick
that follows the riff cannot be built before the riff exists, so they moved as a
block to just after `keysC`. Every builder draws from its own named stream, so
the order of two independent builders is not a fact a record can observe —
and `buildDrums` touches neither `placed` nor `reserved`, so going later cannot
take a seat from a pitched part. **Verified: 0 of 60 records changed by the move
alone**, before any genre declared `followRiff`.

### STILL OWED

- **Three legs of doom sludge and every other genre still have an independent
  kick.** `setting out` and `into the deep` carry SLUDGE_FEET, a deliberately
  sparse foot pattern; whether they want the riff instead is a musical call.
  Dungeon synth's 0.19x — a kick that dodges the riff — is the worst number in
  the table and is untouched.
- **The snare is untouched.** The sources say "kick AND SNARE ... follows the
  main riff"; only the kick does here.
- **The phrase and arc decoration blurs the lock.** `phraseBar` adds hits after
  the kick is placed, so a bar that should be exact unison prints a few extra.
  That is why the figure is 67% and not higher.

## §0as — and it was one leg of one genre, which was the wrong scope (2026-08-22, FIXED)

[owner: *"Why would you focus on one part when we are dealing with WHOLE song
issues?"*]

Fair. §0ar declared `followRiff` on `the fight` alone — one quarter of one
genre, against a complaint that was never about one act. Rolled out.

### AND "THE RIFF" IS NOT THE SAME LANE IN EVERY GENRE

MEASURED, distinct strike-steps a bar, which is what *carries the rhythm* means
when you count it:

```
  genre           keys  ostinato
  lofi             7.5     0.0
  doomsludge       2.9     1.2     <- the comp is the riff
  synthwave        8.2    15.9
  dungeonsynth     1.0     3.2     <- the FIGURE is the riff
  fantasysynth     0.6     1.8     <- and here too
```

Defaulting every genre to `keys` was a lofi habit — the same shape of mistake
`theme.count` records two thousand lines up. `kit.riffLane` is declared now and
`keys` is only the default.

**And an inherited default is still a default.** `riffLane: "ostinato"` sits on
dungeon synth and is inherited by fantasy synth (correctly — 1.8 against 0.6)
and by doom sludge (**wrongly** — 2.9 against 1.2). Caught by measurement rather
than by reading: with the inherited value the fight's off-beat kicks fell from
1,172 to 92 and the lock from 3.42x to 1.57x, because the kick was pointed at
the sparser lane and the floor then handed most bars back to the pocket. Doom
sludge overrides it back to `keys`.

### AND A BAR THE RIFF BARELY TOUCHES KEEPS ITS OWN PULSE

A floor of **two accents**. Below that the bar is not a riff to lock to, it is a
held chord, and the kit plays the pocket it would have played. This file has
already learned that lesson expensively: `kickKeep: 1` on the descent *"took the
kick down to ONE HIT A BAR and left the leg with a tom run and no pulse at
all"*. The floor is what makes this safe to declare on a sparse genre.

### MEASURED, each genre against ITS OWN riff lane

Off-beat kicks only — everybody hits beat one, so agreement there proves nothing.

```
  genre          lane        off-beat kicks   on a riff note   chance   ratio
  lofi           keys              438            90%           51%     1.76x   (untouched)
  synthwave      keys              990            88%           41%     2.12x   (was 1.41x)
  doomsludge     keys             1172            80%           23%     3.42x   (was 1.26x)
  dungeonsynth   ostinato    its figure never syncopates — nothing off-beat to lock to
  fantasysynth   ostinato    same
```

### LOFI IS DELIBERATELY LEFT ALONE

It was already the most locked kit in the file at **1.76x**, the best number
there was, because a laid-back kick and a comp sharing their accents is most of
what the style already is. Declaring 4 was tried and measured: off-beat kicks
doubled (438 → 865) and the ratio **fell to 1.56x** — more of the kit locked in
absolute terms and less in proportion, which is a change and not an improvement.
A genre that measures healthy does not get operated on.

### COST

48 of 60 records changed — every genre but lofi. Throws unchanged at 3 in 600.
The one test: 10 records, 0 threw.

### STILL OWED

- **Dungeon synth and fantasy synth cannot be read by this test**, because their
  figures only strike on the beat. The declaration is in place and changes their
  records, but whether it helps them is unmeasured — it needs a test that reads
  on-beat agreement against a proper baseline.
- **The snare is still untouched**, though the sources name it beside the kick.
- **`phraseBar` decorates after the kick is placed**, which blurs an intended
  unison. That is why the figures are 80-88% and not higher.

## §0at — the "snare" is a taiko, and it catches the riff by adding (2026-08-22, FIXED)

[owner: *"Do the snare also. But our genre focuses on the toms not the snare so
im not sure if this is correct to worry about the snare. I dont even think we
have a snare in the kits"*]

**Half right, and the half that is right matters.** Counted over six seeds a
genre, hits per record:

```
  doomsludge     hat 1199   kick 1006   "snare" 685   tom1+2+3 481 all told
  fantasysynth   hat 1191   kick  847   "snare" 684   toms 475
  dungeonsynth   "snare" 261   kick 234   hat 123   toms 139
  lofi           hat 232   kick 99   snare 89   ...   toms 8
  synthwave      hat 689   kick 231   ride 195   snare 128   ...
```

**There is no wire snare anywhere in the taiko family.** The lane called `snare`
holds `tkMid` — the mid taiko — or `erangDrum`, a hand drum. The owner is right
about that and the name is a lie the file tells itself.

**But it is the third busiest lane in doom sludge and the busiest lane in
dungeon synth**, and bigger than all three toms put together in both. The toms
are the *smallest* lanes in the family, not the focus. So it was worth locking.

### IT ADDS, WHERE THE KICK REPLACES

`followRiffSnare` lays riff accents **on top of** `snarePocket` instead of
replacing it. The kick's pocket is a pulse and a riff can stand in for a pulse;
a backbeat is the thing that says where the bar is, and one that moves to
wherever the guitar went has stopped being one. A drummer catching a figure does
not stop keeping time to do it.

Declared: doom sludge and fantasy synth 2, dungeon synth 1 (its hand drum is
already the busiest lane it has), synthwave 1 (a real snare on a real backbeat —
"2 and 4, unanimous across every source read"), lofi none.

### MEASURED — the mid-drum lane, off-beat hits landing on a riff note

```
  genre          before          after
  doomsludge     33%  1.46x      60%  2.54x
  synthwave      17%  0.58x      73%  1.66x    <- it was AVOIDING the riff
  lofi           55%  1.08x      unchanged, not declared
  dungeonsynth / fantasysynth    their figure never syncopates — unreadable
```

Printout, doomsludge seed 1 bar 204 — backbeat kept, accent caught:

```
  keys   |*--**-*-*--**--.|   riff at 0, 3, 4, 6, 8, 11, 12
  kick   |x..xx.x.x..x....|   follows the riff
  snare  |....x.x.....x...|   pocket 4 and 12 kept, 6 caught from the riff
```

### STILL OWED

- **The lane should be renamed.** Calling a taiko a snare is the same class of
  defect as a table that lies about the music, which this file checks for
  everywhere else.
- **The toms are untouched** and are the genre's smallest lanes despite being
  what it is thought of as leaning on. Whether that gap is the fault is a
  separate question nobody has measured.
- Dungeon synth and fantasy synth still cannot be READ by this test.

---

## §0au — "two parts on one pitch is one part" was an opinion, not a law (2026-08-22, FIXED)

[owner: *"Why is this a rule? And also understand this is code and the only
rules are music theory and constraints not baked in values."*]

### THE RULE, AND WHERE IT CAME FROM

The seam check threw on any two parts sharing a bar, a step and a pitch. Its
justification, written above `clearAgainst`, is one sentence:

> Two parts on one pitch at one instant is one part.

That is a claim about **waste**, not a rule of music. It was written to catch
two real accidents, and it caught them:

- a **blend** averaging two genres' register tables put a drone genre's ground
  on another genre's bass in **110 of 1080 pairs**;
- the **drone** and **generative** lanes place notes without reserving a seat,
  so they can land on a written part after the fact.

Both are register allocation going wrong. Neither is anybody **deciding** to
double a line — and deciding to double a line is ordinary orchestration. Belkin,
already quoted twice in the program, states it from the other side: *"it is
better to double them in unison."* This genre's own sources say it outright —
sludge is bass and guitar playing *"the riff in unison, creating a loud and
BASS-HEAVY WALL OF SOUND"*, and *"sustained unisons enhance mass"*
[corpus:doesitdoom]. The Botch tabs read for the fight are the same figure
written twice: the guitar's is `--2-2-2--` on the low D, the bass's is `D-2222`.

The guard could not tell an accident from a decision because **nothing in the
file had ever said which pairs were meant**.

### AND THE TABLE SAID IT DID THIS ALREADY. IT DID NOT.

`bassRoles` has carried this row since the day it shipped:

```
  C     sludge    `riff`    the bass is ON the riff, in unison
```

The builder never did it. `bassStyle: "riff"` draws the bass its **own** two-bar
figure from its **own** pools on its **own** stream; the comp is a different
figure drawn somewhere else. Two riffs at once is not a unison, it is
counterpoint — the opposite of what the source asked for.

### WHAT LANDED

- `unison: { lane, of, at }` — a genre names one **follower**, one **leader**,
  and which acts double. The follower is rewritten to play the leader's figure
  note for note.
- The line moves in **whole octaves as a body**, not note by note. The first
  version folded each note into the band on its own, and that is not a
  transposition — on this genre's numbers a comp note at MIDI 60 came down to 48
  and the next at 61 came down to 37, an eleventh *below* it, where the line it
  was copying had gone *up* a semitone. Same pitch classes, different figure.
- It still negotiates with **everything except its leader** (`clearAgainst`
  gained an `except`), so the accidental collisions the walk exists for are
  still found.
- The seam check exempts exactly the declared pair, read off `materials.unisonOf`
  beside `chordsOf` — one owner for the rule, so the check and the pass cannot
  disagree about which acts it covers, and a hand edit's private copy (`A@5`)
  is covered by the fact its parent was.
- `unison` is in `BLEND_DRAW`: it names roles and acts, so half of one is a
  follower with no leader.

### DECLARED ON THE CHILD, AND THAT WAS CAUGHT BY MEASUREMENT

Written first beside `bassRoles` — which is **fantasy synth's** table, not doom
sludge's — it doubled fantasy synth's bass too, onto a comp that is a held pad
(0.6 distinct strike-steps a bar against the figure's 1.8). The blast-radius
check showed fantasy synth's whole record moving. Same leak, same catch, as
`riffLane` two sections up.

`at: ["C", "B"]` — the sludge act, where the source names the unison, and the
fight, where both Botch tabs are guitar and bass on one line. `A` keeps its held
power chord (doom's source asks for *"a power chord or single note ... let it
sustain"*, a different job) and the lift keeps its own line, because Belkin's
warning is real from the other side: constant unison doubling is *"the
beginner's most common fault."* Two acts of four double; two do not.

### MEASURED — bass notes landing on a comp onset, 20 seeds

⚠ **The first version of this table was wrong** and is corrected here. I put
fantasy synth's numbers in the doom sludge "before" column, which understated
the baseline by a factor of three and made the change look far larger than it
is. Doom sludge's bass already landed on two thirds of the comp's onsets by
coincidence — both parts are dense — and what the doubling adds is that they
are the same *notes*, not that they are at the same *time*.

```
  act          doomsludge before   doomsludge after
  A                  83%                 83%     <- held chord, coincidence
  B (fight)          69%                 69%     <- not doubled, see below
  C (sludge)         67%                100%
```

Contour agreement between the two lines in the doubled act: **84%**. The
shortfall is the handful of notes folded at the band edge plus the ones
`clearAgainst` moved off an accidental collision.

Printout, doomsludge bar 317 — one figure, three parts on it:

```
  keys   |*-*-*---*--****-|   C#3 E3 A3 ...
  bass   |*-*-*---*--****-|   C#2 E2 A2 ...
  kick   |x.x.x...x.xxx...|
```

600-record sweep: **3 throws before, 3 after**, the same three. Blast radius:
doom sludge only, 12 of 60 records.

### AND IT IS AN OCTAVE DOUBLE, NOT A SAME-PITCH UNISON — SAY SO

Same-pitch coincidence across the record went 1.1% → 1.1%. It did not move,
and it was never going to: this genre's bass band is MIDI **31–48** and its comp
band is **44–67**, so the two barely overlap and the doubled line sits an octave
under. That is what most metal actually sounds like, and the Botch tabs are
notated the same way for the same reason — a drop-D guitar's low D is D2, a
bass's is D1.

The comparison number quoted when this work started — Televators, 201 of 2416
notes sharing a pitch and an instant, 8.3% — was **not** reached and is not
reachable without changing `registers.bass`. Raising its top so the two bands
genuinely meet is an arrangement decision with an audible cost (a thinner low
end) and it is the owner's, so it is written here and not slipped in.

---

## §0av — the drone lane was playing a string section (2026-08-22, FIXED)

[owner: *"The drone is broken not working anymore. And the only drone should be
the Drone, or the drone WAV or the Pad WAV NOT strings or anything else"*]

### MEASURED

```
  doomsludge, 20 records — what served the `drone` lane
    dronebox        67 events        the drone rack
    erStringsLow    56 events        a string section
    erPad           27 events        the pad
```

Seed 1's drone was `erStringsLow` for the **whole record** — one event, 1321
seconds, pitch 25. Seed 7 was a lead sample for six minutes of it. The lane's
own name says what belongs on it and three quarters of the pool did not.

### WHY IT HAPPENED, KEPT RATHER THAN DELETED

The pool was widened to `erLeadLow` on a real measurement: the sample pack's pad
carries 3.4% of its energy at 60–120 Hz against the lead's 28.0%, and *"a drone
with no bottom is not a drone."* That reasoning was sound and the conclusion was
still wrong. The answer to a pad with no floor is not to put a **lead recording**
on the floor lane. An instrument that measures well in one band is still a lead,
and the record has been hearing it as one.

```
  drone: [["dronebox", 5], ["erPad", 2]]        // was 4 machines, two of them not drones
```

Also removed: the ladder row `"the long way home": { drone: "erStringsLow" }`.
Its own note said it was *"the intent and not yet the effect"* because the drone
is dealt once per record rather than per section — an intent to break the rule
the moment the drone became sectional, which is the worst kind of entry to leave
standing. The **keys** override on that row stays: that leg's chords are a string
section on purpose, and `erStringsHi` is a chord voice doing a chord voice's job.

After: `dronebox` 26 records of 39, `erPad` 13. Rendered alone, seed 1's drone
measures RMS 0.031 — it sounds, and it now sounds like a drone.

### ⚠ THE DRONE WAV IS NOT IN THE POOL, BECAUSE IT CANNOT PLAY A NOTE

The bank holds `sfxDrone`. Its root frequency in `ERANG_INDEX` is `0.0000` — an
**unpitched** recording, which is why it is filed as an atmosphere bed and has no
`INSTRUMENTS` entry to name. The file already has the mechanism for a ground like
that (`drone.unpitched`, built for boxcar synth's train, which *"is not playing a
note"*), so putting the drone WAV on this lane is possible and is a separate
piece of work. Written down rather than half-done.

---

## §0aw — the doubling never reached the audio, and the hash check caught it (2026-08-22, FIXED)

Build 2026-08-22i shipped §0au's unison doubling. **It changed nothing that
sounds.** The material held the doubled line, the printout showed it, and the
performance was byte-identical to the build before it across every seed.

`materialTakes: { bass: 3 }` builds three realisations of that lane, and stage 5
swaps one in for every occurrence — gated on `notes === mat[role]`, which is true
precisely *because* the unison pass replaced that array. So the doubled line was
written, stored, printed, and then overwritten by one of three undoubled takes
every time it was about to sound.

The fix is to drop that lane's takes in the acts that double, and it is the right
answer musically rather than a way out of a bug. Takes exist because *"nobody
plays the same bar twice"* — they are three **different** realisations of a part.
A doubling has one: it is the other part's line. The variation now has to come
from the leader, which is where it belongs, and the source is asking for exactly
that in this act — sludge's bass is *"monotonous and heavy"*, a *"'rocking to
sleep' bass that locks to the guitar"* [melodigging].

**The lesson is the check, not the bug.** A feature that measures right in the
materials and byte-identical in the performance is a feature that does not exist.
`hashnotes` over 60 records is what said so; the printout and the material-level
measurement both reported success.

### ⚠ AND IT STILL CANNOT BE HEARD, FOR A SECOND REASON — OWNER'S CALL

`form.roles["into the deep"]` is `["drums","bass","keys2","lead","ostinato",
"drone"]`. **The sludge act has no `keys` lane**, so the part the bass was told to
double does not play in the act that doubles it. The file already knew: the
`compEntry` note beside `keysStyleAt` says in as many words that *"`C` is inert
today ... the sludge act has NO `keys` lane at all ... putting `keys` into a
movement's roles is an arrangement decision rather than a comp one. It goes to
the owner, not into this table quietly."*

Two features are now waiting on that one decision, and a third thing follows from
it: the kick's `followRiff` locks to material C's `keys` too, so in that act the
kick is doubling a riff nobody is playing.

The act's own source describes *"down-tuned, HEAVILY DISTORTED guitars"* over a
bass in unison. It currently has a mellotron pad, a figure, a lead and no guitar.

---

## §0ax — two acts of four played one material six times (2026-08-22, FIXED)

[owner: *"Im seeing the rule of three not being adhered to. I dont want songs
that ONLY repeat the same notes that is not the same as making sure something
comes back at other points or that the motif travels through."*]

### MEASURED — what each movement plays, in order

```
  seeds 1, 7 and 42 alike
    setting out         A  Adev  A  Avar  A            two devices, working
    into the deep       C  C  C  C  C  C               ← six statements, one tune
    the fight           B  B  B  Bdev  B  Bvar  B      two devices, working
    the long way home   Alift ×6                       ← six statements, one tune
```

Half the record was one tune stated over and over. `006` names it: *"repeating
something beyond three times is generally speaking overusing that idea, and
actually using it more than two times is overusing it."*

Two separate causes, and neither was a missing mechanism.

### 1 — THE WALK HOME'S VARIANT WAS BUILT AND LOOKED UP UNDER THE WRONG NAME

`Avarlift` is assembled beside `Alift`, given its own takes, and frozen with
every other material. Stage 5 looked for it as `Aliftvar` — a name nothing has
ever stored anything under — so the device list came back empty for the whole
final movement.

The suffix goes on the **inside** for a lifted material, because `lift` is not a
device: it is which key the material is in, applied after the device was chosen.
`Alift` + `var` is `Avarlift` — A, varied, lifted.

**This is the third time this file has shipped a lookup under a name its own
builder does not use** — `materialTakes` under the occurrence tag, `drumPhrase`
under a private copy's name, and now this. All three had the same signature:
built, declared, frozen, and silently missed, so nothing reported a fault
because nothing was ever reached.

### 2 — THE THIRD MATERIAL HAD NO DEVICE TO COME BACK WITH

The file already knew and wrote it down: *"THEY DEVELOP BY THINNING RATHER THAN
BY SWAPPING. No Cvar/Cdev/Cseq is built — the variants are hand-assembled per
family from their own parts, so making them is a build and not a table entry."*

That is true, and this is the build. `Cvar` keeps the opening two bars and
redraws the tail; `Cdev` keeps the rhythm exactly and redraws the notes — the
same two devices A and B have had since they shipped, assembled the same way
from C's own parts, against C's own accompaniment, inside C's own register.
Verified per seed: `Cdev` keeps C's rhythm exactly, `Cvar` keeps C's opening two
bars exactly, and all three differ from each other.

`twist` gained an optional register argument for this (it had A's band
hardcoded, which is within a tone of B's and a fourth off C's). Both existing
callers pass nothing and compute the identical line.

**It is not "make the record repeat."** Both devices keep something and change
something, which is what a restatement is. The accompaniment does not move, for
the reason `Avar`'s own note gives: *"the tune is what develops; changing the
band as well would make it a different section rather than a restatement of this
one."*

### AND THE SPLICE NEEDED THE LAW ASKED OF IT

A drawn part is legal by construction. A part **assembled from two others** is
not. Giving C the `vary` device threw on the first sweep — `dungeonsynth 102:
out of key ... in Cvar: lead 78 bar 2` — because a `vary` splice joins one
tune's opening to another's tail, the line is a **loop**, and the last note's
resolution is the first note, which the splice replaces.

`legalise` already existed for exactly this, inside the hand-edit block, under a
comment explaining the same hazard in the same words. It is now defined once in
stage 3 and both callers ask it. There were two copies of that law for one
commit, and that is one more than this file allows.

### MEASURED — after

```
  genre          sections repeating the one before them      longest run of one material
                    before        after                        before      after
  lofi                10%          10%                           1.8        1.8
  synthwave           17%          17%                           2.8        2.8
  dungeonsynth        17%          17%                           2.4        2.4
  doomsludge          55%          21%                           6.5        2.8
```

Doom sludge now sits with the other three. The genres that were already fine did
not move — the C devices exist for every genre and are only reached where a
section actually asks a bridge to vary, so nothing changed where nothing was
wrong. 600-record sweep: 3 throws before, the same 3 after.

### ⚠ STILL OWED

- **Nothing comes back ACROSS acts.** Each movement plays its own family and
  then abandons it: `A` never returns after the opening, `C` and `B` never
  return at all. The named technique is **cyclic form** — *"the repetition, in a
  later movement or part of the piece, of motives, themes, or whole sections
  from an earlier movement in order to unify structure"* [wikipedia/Cyclic form],
  and Berlioz's idée fixe is the same idea *"introduced in the first movement and
  varied or transformed in each of the subsequent movements."* The motif already
  travels (the printout's tune block shows A → augment → fragment); whole
  materials do not. `form.material` is one string per movement and would have to
  become a plan that names a recall.
- **`drumVariantOf("Bdev")` answers `"main"`, not `"lift"`.** `Bdev` is the
  chorus developed and should carry the chorus's kit. It looks like the same
  stale-list fault one family over; it is left alone because fixing it moves
  records this change has nothing to do with.

---

## §0ay — the speaker was open to 9 kHz (2026-08-22, FIXED)

[owner: *"Dial back the FX a bit its getting to harsh at times."*]

Two ceilings in the fight's chain sat outside anything a real rig does.

```
  the fight, before          after
    fuzz cab   9000 Hz       5000 Hz      the speaker
    saw tame   7500 Hz       5200 Hz      the knob whose panel caption is "harshness"
```

`tame` is literally labelled **harshness** in its own panel, its default is 6000,
and the fight had it at 7500 — above the default, on the one control named for
the thing the owner complained about.

The sources are unanimous and specific: *"the usual bandwidth limit of a guitar
speaker is about 4-5 kHz (-3 dB roll off)"*; cabinet simulators *"in their
simplest form use a typical low pass filter with roll off at about 4-5 kHz"*; the
*"steep drop-off above 5K keeps distorted tones and harmonics from sounding
fizzy"*; and where speakers do run flat past 10 kHz, distortion comes back
*"fizzy on top of fizzy"* [wgsusa; hexefx]. Speaker fizz is catalogued as **low
fizz 2–4.5 kHz** and **high fizz 4.5–7 kHz** [guitarrecordinglounge]. Ours ran to
9 kHz with a two-stage clipper in front of it.

5000 is the **top** of the real range, so the fight is still the brightest of the
four acts (3800 / 3000 / 5000 / 4500-off) and the front edge of the note still
arrives — a transient's edge lives under 5 kHz. 5200 puts `tame` on the Miller
poles the fuzz already builds inside its own clipping stages, so the two units
stop at the same place.

### MEASURED — the filter's own response, 44.1 kHz, Q 0.707

```
   2 kHz  -0.1 dB      5 kHz  -2.8 dB      8 kHz   -8.0 dB
   4 kHz  -1.3 dB      6 kHz  -4.6 dB     10 kHz  -10.3 dB
```

Nothing below 3 kHz moves by half a decibel. It is the fizz band and only the
fizz band. No drive, level or gyrator setting was touched: the chainsaw keeps
its teeth and loses its fizz.

---

## §0az — the drone never reached the live graph, and the fix for it could not see it (2026-08-22, FIXED)

[owner: *"I just played a random seed and NO DRONE WORKING."*]

### THE SYMPTOM THAT MISLED ME

§0av fixed a real fault — the drone lane was drawing a string section — and I
verified it by **rendering the drone alone**: RMS 0.031, it sounds. That check
could not have failed, because the offline renderer was never the broken path.

`perform` walks every event and has no skip at all. `playLive` has one.

### MEASURED — driving the real play button with `dispatch` instrumented

doomsludge seed 2, three seconds of live playback. Everything dispatched:

```
   tape|tape        1
   tape|atmos       1
   weather|atmos    1
```

And nothing else. The drone is events **0 and 1** of the array. Not dispatched,
not counted as dropped, no error thrown. The live channel list confirms it from
the other side — `bass|bass`, `bass|contrabassoon`, `keys|horns`,
`lead|bassOboe` all exist after playback; **there is no `drone|dronebox`.**

### THE LINE

```js
    let i = 0;
    while(i < events.length && events[i].tSec < skip) i++;    // skip = 0
```

The drone's `tSec` is **-0.01**. Humanising moves every onset a few milliseconds
either way, so the ground's own start lands on either side of song zero **on a
coin** — which is exactly why it worked on some seeds and not others, and why a
random seed found it when three fixed ones had not.

A ten-millisecond head start on a twenty-minute note was read as *"this moment
has passed."*

### AND THE RULE WRITTEN FOR THIS FAULT COULD NEVER FIRE

The pump already carries a mid-flight rule, added under the owner's *"now the
drone makes zero noise"*, whose comment states the case exactly: *"A GROUND THAT
STARTS AT ZERO AND LASTS TEN MINUTES HAS MEANING AT EVERY INSTANT OF THOSE TEN
MINUTES, and playing the record from anywhere but its first second dropped it for
the whole rest of the record."*

That rule lives in the **pump**, and the pump only judges events the skip loop
has left in the stream. It was fixed for a **stall** and never for a **seek**,
and nothing measured the difference. Two builds carried a comment claiming a fix
that the line above it had already made unreachable.

### THE FIX

The skip asks the same question the pump asks — not *"has it started"* but *"is
it still sounding"*. Anything genuinely finished is skipped as before; anything
still ringing is carried and struck at the needle with what is left of its life.
Same threshold as the pump's rule, so nothing percussive or melodic is revived
late.

### MEASURED — the drone bus meter during live playback

```
  seed / start        before      after
  seed 2, from 0 s     0.0%        7.3%
  seed 2, from 400 s   0.0%       14.2%
  seed 1, from 0 s     0.0%        7.8%
  seed 1, from 400 s   0.0%       11.7%
```

Composition is **byte-identical** across all 60 hash records — this touches
playback only. 600-record sweep: 3 throws before, the same 3 after.

### THE LESSON, AND IT IS THE SECOND TIME THIS WEEK

§0aw: a feature that measured right in the materials and byte-identical in the
performance did not exist. This one measured right in the **render** and silent
in **playback**. Both times the check I ran was on the wrong side of the seam
from the thing the owner was listening to. A drone verified by `renderWav` says
nothing at all about whether pressing play produces a drone, and the harness has
no live-playback probe. That gap is what let two builds ship.

---

## §0b0 — the mathcore comes out; the climax is made of tempo (2026-08-22)

[owner: *"WE ARE NOT COPYING THESE GENRES I ALREADY MADE THIS EXPLICIT TO YOU!
NO Guitar. This is an offshoot of Dungeon Synth that injects rock genres back
into the Dungeon Synth!"*]
[owner: *"Take out the Mathrock ... The last section the progrock sounds really
good, the sounds and effects are great. Lets bring that to the forefront. We
still want the fight the high point of the song and we want it to be a faster
BPM than the rest of the song more."*]

### WHAT I HAD WRONG

I spent a day reading this genre as a band — measuring its comp as a guitar,
proposing a guitar be added, treating the orchestral palette as the defect. It
is not a band and never was. **It is dungeon synth with rock driven into it**,
and the horns, strings, string machine and taiko are the point.

That correction invalidated my own previous change (power-chord voicing, §0au's
successor) and it has been **reverted in full**: it was aimed at a guitar
reading, it hollowed out the minor colour dungeon synth lives on, and it cost a
throw. 600-record sweep back to the standing 3.

### THE FIGHT

Mathcore's whole vocabulary — start-stop riffing, accent displacement,
single-note dissonance — is written for a picked electric guitar. Asking this
record to do it produced the chainsaw dimed over a five-part orchestra: 7.5
notes ringing at once with 5.2 of them in one clipper, which the owner heard as
*"smashed garbled trash"*.

So the climax is now made the way this record already makes its best section:

| | before | after |
|---|---|---|
| **the fight, BPM** | **120** | **139** |
| setting out | 72 | 69 |
| into the deep | 96 | 92 |
| the long way home | 77 | 74 |

The fight was 1.67× the opening act. It is now **2.01×** — twice the tempo of
the music it interrupts.

- **`saw` off in this act.** The HM-2 was the one unit whose entire character
  was the genre being removed, and it is the unit that turned five voices to
  mud. The Muff stays and goes hotter — drive was never the fault. The other
  two acts keep theirs untouched.
- **`fuzz.amt` 1 → 0.62**, so the dry half of every part comes back.
- **`kickPattern: HARDCORE_FEET` dropped.** A sixteenth-run double-kick figure
  at 139 BPM is a blast beat. The leg falls back to the genre's own walk, played
  fast. `followRiff` 6 → 4, the family's number.
- **The polymeter cells go.** Seven- and five-against-four are accent
  displacement. Replaced with six-against-four — a hemiola, which is what a prog
  keyboard ostinato is built on and sits *inside* the metre instead of fighting
  it.

### THE PHASER IS THE RECORD'S SOUND, NOT ONE SECTION'S

`phaseRows` was `["lead"]`, on the reasoning that *"the Shine On pair is one
guitar, not a band"* — correct about Gilmour, wrong about a record with no
guitar. What the owner is hearing in the walk home is a phaser on a **string
machine**: the sweep is what turns a static pad into weather.

```
  phaseRows: ["lead"]  ->  ["lead", "keys", "keys2", "ostinato"]
```

The two sustained parts that most want it are the two it never reached. The
**compressor is not widened with it** — it is the most expensive node on the
board (2.8 s of a nine-second render across five parts) and genuinely is a
per-instrument pedal. The fight also gets the phaser, run fast (rate 0.62
against the walk home's 0.10): one record, one sound, two tempos.

### AND A THINNING THAT NEVER FILLS BACK IN IS A FADE

[owner: *"there is a large section prior to the fight that is just nothingness"*]

`into the deep` runs six sections of one material, so `sec.occurrence >= 3`
thinned **30 of its 48 sections** — a four-minute decrescendo. The device is
right; what was wrong is that it only ever went one way. It alternates now:
3rd thin, 4th full, 5th thin.

⚠ I wrote in the code first that this would be byte-identical for genres that
never reach a fourth statement. **The hash check refuted it on the first run** —
5 dungeon synth, 8 lofi and 11 synthwave records moved. Fourth statements are
not rare.

```
  genre          thinned share       longest run of thinned sections
  lofi            17% -> 15%              2 -> 2
  synthwave       31% -> 18%              2 -> 1
  dungeonsynth    23% -> 17%              3 -> 2
  fantasysynth    39% -> 21%              4 -> 2
  doomsludge      39% -> 21%              4 -> 2
```

The runs matter more than the shares: nothing anywhere can thin twice in a row
now, so no genre can fade for four sections together. That fault was never only
this record's.

### STILL OWED

- **The comp is 55% of the fight's sound**, 1,715 notes against the tune's 162.
  The motif is structurally correct and buried ten to one. Untouched by this
  pass.
- **Hard stops.** My first diagnosis — that the figure, pad and counter get no
  reverb — was **wrong**: `MIX_ROLE_BUS` puts `keys2` and `ostinato` on the keys
  bus and `counter` on the lead bus, so `space.feeds` already covers them. The
  real candidates are release times: brass 0.13 s, hurdy-gurdy 0.09 s,
  contrabassoon 0.16 s, each sourced for the real instrument and each wrong for
  a genre rooted in sustain. Not yet addressed.

---

## §0b1 — the fight is deleted (2026-08-22)

[owner: *"There was ZERO change its shit! Erase the mathcore section
altogether!"*]

Two rounds of taking the mathcore **out of** the act did not work. The reason is
what was left: the act's whole identity was a vocabulary written for a picked
electric guitar — start-stop riffing, accent displacement, single-note dissonance
— and this record has no guitar and is not getting one. Strip the chainsaw, the
blast feet and the polymeter and there is nothing of its own underneath.

Checked first that the page was not stale: the published artifact carried build
`2026-08-22m`. The changes shipped and were not enough.

**The movement is deleted.** The record is three acts: setting out, into the
deep, the long way home.

### AND TWO THINGS I GOT WRONG ON THE WAY, BOTH CAUGHT BY THE CLOCK

**1. I handed the fight's 116 bars to the other three legs.** The arc is
normalised — *"it redistributes time and never adds any"* — so three legs
covering a third more bars inside the same total seconds simply runs the whole
record faster. Every act rose about 15%. A record with a third of its music
removed is a **shorter** record, not a faster one. The legs keep their own
budgets and `form.target` comes down from 432 bars to 252.

**2. The base tempo is the record's MEAN, not any act's.** Deleting the fastest
third makes every remaining act speed up to hold that mean:

```
  act                 before    fight removed    after fixing the base
  setting out           72           81                  69
  into the deep         96          107                  91
  the long way home     77           86                  74
```

107 BPM is outside the band the sludge act's own sources give it, and nobody
asked for a faster record — only for one act to go. `tempo` comes down from
[84, 96] to [72, 82] by the amount the fight was holding it up.

### WHAT IT COSTS, STATED RATHER THAN PATCHED

One movement plays one material family, so with this leg gone **material B — the
chorus, and the whole `Bvar`/`Bdev`/`Bseq` family — is built and never played.**
That is dead weight. Giving another leg a chorus to soak it up would be a musical
decision nobody asked for, so it is written here instead: the owner decides
whether the hook returns somewhere else or B stops being built.

Every table entry keyed `"the fight"` is now unreachable — the fuzz row, the
pedalboard, the kit, ~30 motion curves, the feature rotation, `floorAt`,
`empty`. **They are left in place**, because forty deletions in the same pass
that removes the act is how a revert becomes impossible. A genre asked for a
battle again should get its tables back.

Record: 316 bars, 19 sections, ~16 minutes (was ~19). 600-record sweep: 3 throws
before, the same 3 after.

### AND THE THING THAT IS STILL TRUE

The comp is **55% of the record's sound** and outnumbers the tune ten to one.
That was measured in the fight and it is a property of the comp, not of the act
that is now gone. It is the next thing.

---

## §0b2 — the owner's A/B was inside his own record (2026-08-22)

[owner: *"The whole thing is disconnected. And wrong. The only part that works
is the pink floyd ending. The rest is trash."*]

That sentence is the most useful thing anyone has said about this genre, because
of one fact I had not put together: **`setting out` plays material A, and `the
long way home` plays `Alift` — the same tune, lifted into another key.** He loves
one and calls the other trash. It cannot be the music. It is the arrangement, and
the arrangement is measurable.

### MEASURED — share of each act's notes, by part, 8 records

```
  the long way home    keys 81%   keys2 10%   lead 8%   counter 1%      <- works
  setting out          ostinato 42%  keys 21%  bass 18%  lead 13%       <- "trash"
  into the deep        bass 57%   ostinato 24%  lead 11%  KEYS 0%       <- "trash"
```

The act that works is **a chord bed with a tune over it**. The two that do not
are a rhythm section with nothing underneath — and the sludge act has **no chord
part at all**. Its largest voice is the bass, at 57%.

That is what "disconnected" is. Nothing holds the harmony, so every part is a
separate event happening near the others.

### AND THE OTHER HALF IS THE DIRT

```
  act                 dirt units on it        fuzz amt
  the long way home   none (phase + comp)       0        <- works
  setting out         Muff + HM-2               1
  into the deep       Muff + HM-2               1
```

Every act the owner calls trash had the HM-2 dimed over it. The one he names has
no dirt unit at all.

### WHAT LANDED

1. **`into the deep` gets a `keys` lane.** It had none. *This was found days ago,
   written up as an owner decision and left.* Leaving it was the mistake: an act
   with no chords is not a choice awaiting approval, it is a hole.
2. **`keysStyleAt.A`: `"hold"` → `"comp"`.** The pad came from doom's own source
   — *"let it sustain"* — and it is why the same material measures 21% keys in
   one act and 81% in the other. The source is about a guitar; this record has
   none; the owner's verdict outranks the citation.
3. **The HM-2 comes off every act.** The Muff stays and goes hotter — the sources
   for these acts are about weight ("molten lava, congealing tar") and a Muff is
   a warm sustaining box, where the HM-2 is fizz and velcro built for one
   specific guitar sound.
4. **`fuzz.amt` 1 → 0.42 / 0.50.** It is a dry/wet blend; at 1 every part arrives
   fully clipped with no clean signal beside it, over a bed that is now half the
   act's notes. Sustain rises on both, because weight is drive, not blend.
5. **The ending's two pedals go on every act** — phaser and compressor, slower
   and shallower on the acts carrying drums. One sound world at three weights
   instead of three unrelated ones.

### MEASURED — after

```
  act                 keys share      voices at once
  setting out          21% -> 56%       5.3 -> 6.7
  into the deep         0% -> 51%       5.3 -> 8.4
  the long way home    81% (untouched)  8.4
```

Both weak acts now sit between where they were and the act that works. Tempos
unchanged (69 / 91 / 74). 600-record sweep: 3 throws before, the same 3 after.

### THE LESSON

I spent this session measuring parts in isolation and asking the owner to
adjudicate arrangement questions. The answer was sitting in the record the whole
time: **one act works, one act is the same material and does not, so diff them.**
Nothing about that needed a source, a genre reading, or permission.

---

## §0b3 — the over-reach, reverted; and the law a derived tune never asked (2026-08-22)

[owner: *"I didnt tell you i wanted to whole song to be like the end i said
thats the only part that is working right now"*]

§0b2 read a REPORT as an INSTRUCTION. "The ending is the only part working" is a
statement about the current state; I turned it into "make everything resemble the
ending" and shipped five changes on that basis. Reverted:

- `keysStyleAt.A` back to `"hold"` — the held chord is doom's own character and
  the only thing giving that act a shape of its own. Making all three acts comp
  is a *worse* answer to "the whole thing is disconnected" than the fault it was
  meant to fix: one texture for the whole record.
- The HM-2 back on both slow acts, and the ending's phaser/compressor off them.
- `fuzz.amt` back to 1 on both. These acts **are** the wall — *"down-tuned,
  heavily distorted"*, *"a bass-heavy wall of sound"* — and the owner has never
  complained about them. He complained about the fight, and the fight is gone.

The A/B those changes leaned on is **confounded four ways**: the act that works
also has no drums, no bass and no figure. Picking the dirt out of that and acting
on it was a guess presented as a finding.

### THE ONE THING KEPT

`into the deep` gets a `keys` lane. It had **none** — its largest voice was the
bass at 57%. That stands on its own: the owner complained about that act, in
those words, before he ever said which act worked. With `keysStyleAt.C: "hold"`
rather than `"comp"`, because comping took the act from 2.38 notes a second to
**4.85 — denser than the ending** — and buys a busy bass with it, since this
genre doubles its bass onto the comp. Held chords fill the harmony without
flooding it: average note length in that act goes **1.38 s → 2.66 s**.

### AND THE BUG UNDERNEATH IT ALL — 3 STANDING THROWS DOWN TO 1

Seed `doomsludge 119` threw **twice this week from two unrelated changes** —
once when the comp stopped voicing thirds, once when it went from comping to
held. Both were changes to the **comp**. Neither touched the tune.

A builder where editing one part can make a *different* part illegal has a hole
in it, and the hole is that the motif branch of `buildTheme` never asks the law.
A **drawn** theme is legal by construction — every branch places notes with
`degMidi` (in-mode by definition) or `nearestTone` (a chord tone by definition).
A **derived** theme is not:

- **The source's mode is not this one.** Material A stands in C phrygian, the
  bridge in C minor. Phrygian has a flat second; minor does not. A contour
  carried between them can land on a pitch class this mode has never had.
- **The law is about a note AND ITS NEIGHBOUR.** An out-of-key note is legal when
  it steps into a chord tone — so whether it survives depends on what comes next,
  and what comes next depends on the comp the tune was drawn against.

`legalise` is already the single owner of that law and already asked by the
hand's edits and by the spliced `vary` devices. The motif branch asks it now.

```
  600-record sweep     before: 3 threw      after: 1 threw
    dungeonsynth 64      threw   ->  composes
    doomsludge   35      threw   ->  composes
    doomsludge  119      threw   ->  composes
    lofi         17      threw   ->  still throws (a different cause, unfixed)
```

Two of those three had been standing for days and were logged as a harmony fault
in `deriveCounter`. They were this instead.

### AND THE HONEST LIMIT ON ALL OF IT

Every judgement in this file about whether something *sounds* better is an
inference from note counts. There is no listening loop. Six consecutive builds
have been reported as improvements and heard as no change or worse. The note
counts are real; the claim that they mean anything to a listener is not, and
should be read that way until something renders and measures actual audio.

---

## §0b4 — the genre was 36 changes when the concept was three (2026-08-22)

[owner: *"All I wanted to do was take Dungeon synth and inject the heavy
distortion of rock back into it and make it a little more lively this can be done
with bpm and instrumentation"*]

That is the whole concept, stated plainly for the first time, and it is three
changes: **distortion, BPM, instrumentation.**

### MEASURED — doom sludge against its root

```
  identical to dungeon synth : 27      <- and they are the small ones:
  OVERRIDDEN                 : 24         tape, rig, legato, accent, kick, swap
  added by doom sludge       : 12
```

Twenty-four overrides, and what they replaced is everything that decides what a
genre *sounds like*:

```
  ostinato       the repeating figure — dungeon synth's whole identity, and the
                 thing the owner has asked for three times as "a repeating
                 altering motif, the thing that holds it together"
  theme          the tune
  modes, progressions, bridgeProgressions, chorusProgressions    the harmony
  registers      where every part sits
  voicing, counter, drone, parallels, pocket, groove, roleGain
```

**None of those is BPM, instrumentation or distortion.** The genre stopped being
dungeon synth with rock in it and became a different genre wearing the name —
and *"the whole thing is disconnected"* is what that sounds like from the
outside. The root's glue was replaced piece by piece until nothing was holding
it together.

### WHAT LANDED

The root's tables are handed back at the end of the genre's own definition. What
stays overridden is the concept and nothing else:

```
  KEPT   tempo              the BPM
         machines, kit      the instrumentation — drums are instruments
         space              the distortion: fuzz, pedalboard, room
         form               the three acts and the ending, which is the one part
                            the owner says works and lives nowhere else
         label, params, motion, atmos, drumDrive

  overrides: 24 -> 10        inherited unchanged: 27 -> 41
```

### MEASURED — the record after

```
  act                notes/s   avg note   voices at once   leading part
  setting out          1.65      2.29s        4.4          ostinato 49%
  into the deep        1.49      2.36s        4.4          ostinato 47%
  the long way home    3.17      1.79s        6.3          keys 82%   (untouched)
```

The **ostinato is the backbone of both slow acts** — dungeon synth's repeating
figure carrying the record, which is what the genre is. Notes are held about
70% longer than before (1.38 s → 2.36 s in the sludge act), and the crowding
drops from 5.3 simultaneous voices to 4.4.

Instrumentation and distortion are untouched: taiko kit, horns, mellotron,
hurdy-gurdy, cor anglais, string machine, the Muff and the HM-2 still on the
two heavy acts. Tempo untouched at 69 / 91 / 74 against the root's 52–78.

600-record sweep: 1 throw, unchanged. Blast radius: doom sludge only.

### ⚠ THE SUPERSEDED TABLES ARE STILL IN THE FILE

They are sourced work — the four-acts research, the bass sheet, the voicing
measurements — and deleting a thousand lines in the same pass that switches them
off is how a revert becomes impossible. `FROM_ROOT` is the switch: take a name
out of that list and the genre's own table is live again on the next build.

### AND THE OPEN QUESTION

Twelve keys were **added** rather than overridden — `bassRiff`, `bassRoles`,
`unison`, `keysStyleAt`, `compEntry`, `materialTakes`, `extensionsAt`, `chase`,
`transitions`, `fxPlan`, `desk`, `bridgeAfterChorus`. They are additive features
rather than replacements of the root's character, so they are left alone. Some
of them are the rule-of-three machinery and earn their place; others may be more
of the same drift and have not been examined.

---

## §0b5 — mathcore is not hardcore, and the fight comes back (2026-08-22)

[owner: *"But i wanted sludge and doom and a heavy fast hardcore fight and the
pink floyd homecoming. But youve failed to pull that off"*]

I deleted this act on *"erase the mathcore section"* and that was the wrong
reading of the wrong word. **Mathcore and hardcore are not the same music**, and
the difference is exactly why one of them failed here and the other need not:

```
  mathcore   angular, technical, odd metres, accent displacement, single-note
             dissonance, start-stop. Written for a picked electric guitar,
             which this record does not have — which is why two rounds of
             tuning it produced nothing an ear could find.
  hardcore   FAST, BLUNT, DRIVING, REPETITIVE. Straight feet, a riff that
             hammers, no cleverness. None of that needs a guitar. It needs
             tempo, weight and a kit, and this record has all three.
```

The act came back as the **simpler** music, not the harder one.

### THE FOUR ACTS THE OWNER ASKED FOR, MEASURED

```
  act                 BPM   notes/s  avg note  leading part   dirt
  setting out    doom   69    1.44     2.18s   ostinato 56%   Muff + HM-2, fuzz 1
  into the deep  sludge 92    1.46     2.18s   ostinato 48%   Muff + HM-2, fuzz 1
  the fight      HC    139    6.70     0.99s   keys 70%       Muff + HM-2, fuzz 1
  the long way   Floyd  74    3.39     1.77s   keys 81%       phaser + comp, fuzz 0
```

The fight runs at **twice the tempo of the act it interrupts**, at a quarter of
its note length, and it is the only act whose board is about aggression rather
than weight. The walk home is untouched — it is the one part the owner says
works and nothing in this pass went near it.

### WHAT MADE IT HARDCORE RATHER THAN MATHCORE

- **`HARDCORE_FEET` back on the kick.** I removed it on "take out the mathcore"
  and the name of the constant is the argument against having done that: it is a
  *hardcore* kick figure. What makes an act mathcore is the feet fighting the
  metre; what makes it hardcore is a straight relentless run that never varies.
  The pattern was always right — the act around it was the wrong genre.
- **`followRiff` back to 6.** Its own note: a leg *"whose whole character is the
  band hitting together does not want two good independent parts; it wants
  one."* That is more true of hardcore than it ever was of mathcore.
- **The chainsaw is back on this act and this act only.** The phaser I put here
  is off again — a sweeping filter is the opposite of blunt, and blunt is the
  brief. The speaker stays at 5 kHz, which was the harshness fix and is
  unrelated to how heavy it is.
- **The polymeter stays gone.** Seven-against-four is accent displacement, which
  is the mathcore device. Hardcore does not do that.

### AND TWO NAMES CAME OFF `FROM_ROOT`

The previous build handed 14 tables back to dungeon synth. Two of them were not
the root's *character*, they were this record's *weight*:

- **`pocket`** — the root's kick pool has no double-time entry. This genre's own
  holds one, and the note beside it says what it is for in six words: *"the
  double-time walk, for the fight."* Handing it back took the fast act's feet
  away in the same pass meant to make it faster.
- **`roleGain`** — the root balances a quiet genre (bass 0.22, lead 0.57). This
  is a loud record with its own (bass 0.55, lead 0.72). Restoring the root's
  balance **halved the bass** on a record whose first two acts are a wall.

Everything else on that list stays the root's: it decides what the music *is*
rather than how hard it hits. Overrides now 12, inherited 39.

600-record sweep: 1 throw, unchanged.

---

## §0b6 — doom sludge deleted; DS2 is the root plus four things (2026-08-22)

[owner: *"DELTE the Doom and Sludge genre! Its a failure. We might as well take
the Dungeon synth genre clone it rename it to DS2. Then we tweek it so that it
has a climax that has a higher tempo and double kick pedal. And we want to turn
on the heavy FX, make sure that there is no HARD switching only at transitions."*]

`doomsludge` is **deleted** — 1,213 lines. It had grown to 24 of dungeon synth's
tables overridden and 12 added, which is a different genre wearing the name, and
every attempt to steer it back was steering something that had already left. The
sourced research survives in `docs/genre-research` and in the file's history;
the constants it introduced (`SLUDGE_FEET`, `HARDCORE_FEET`) are still here and
one of them is now load-bearing again.

`GENRE.ds2` is a clone of dungeon synth plus **four** things, and the list is the
whole design. Everything else — harmony, figure, tune, registers, rooms,
instruments — is the parent's by inheritance.

### 1. A CLIMAX AT A HIGHER TEMPO

`deeper` is already the leg the parent's own plan points at: the only one that
ends on a chorus and the only one whose pool leads with one. It had simply never
been faster than its neighbours.

```
  movement    dungeon synth      DS2
  descend          64             51
  halls            62             57
  deeper           63             92     <- the climax
  return           64             54
```

The parent is flat at 62–64. The climax now runs at **1.7× the legs around it.**
`tempoArc` is normalised, so this redistributes time rather than adding any —
which is also why the three quiet legs sit below 1: pulling them down is what
buys the climax its jump without making the whole record faster.

### 2. A DOUBLE KICK, IN THE CLIMAX AND NOWHERE ELSE

`HARDCORE_FEET` on `kit.arc.setAt.deeper` — the sixteenth-run double-kick figure
this file already held, put in one leg and no other.

```
  kick hits per second     descend 0.37   halls 0.43   deeper 0.94   return 0.33
```

### 3. THE HEAVY FX, ON

The parent declares no dirt at all. One unit and a cabinet rather than the
five-pedal board the deleted genre carried: a Big Muff is warm, sustaining and
second-order, and warmth is what makes a synth orchestra heavy instead of fizzy.
The drums are deliberately **not** on the row — a taiko through a fuzz is a
different instrument.

```
  movement    fuzz amt   sustain   cab      Muff
  descend       0.22      0.48     3600     0.24
  halls         0.34      0.58     3800     0.40
  deeper        0.68      0.74     4800     0.66  + compressor
  return        0.18      0.45     3400     0.20
```

Every cab sits inside what a real speaker passes (4–5 kHz), and `amt` is a
dry/wet blend rather than a wall — the difference between the quiet legs and the
climax is most of what makes the climax arrive.

### 4. NO HARD SWITCHING — AND THIS ONE IS AN ENGINE FAULT, NOT A TABLE

**Every number on the pedalboard was written with `setValueAtTime`, which is an
instantaneous jump.** At a movement boundary the drive, tone, cabinet, mids,
mass, compressor and sag all snapped to new values inside one sample — a hand
yanking seven knobs at once. That is the hard switching, and it was in the engine
the whole time, affecting every genre that ever declared a per-section board.

`g.glide` replaces the jump with a ramp. **29 automation calls converted**, plus
four written by hand. Two things make it correct rather than merely smoother:

- `cancelAndHoldAtTime` freezes the curve **at the boundary** and ramps from
  whatever the value actually was then. Reading `param.value` instead would read
  the value *now* — at song-arm, when the whole record's automation is written
  in one pass — so every ramp would start from the wrong place. Where a browser
  lacks the call it falls back to the jump it replaces, so nothing is worse.
- The ramp **starts at the transition**, which is exactly what was asked: the
  act's setting is still whatever the table says for the whole act, and the
  boundary is still where the move happens. What changed is that the move now
  takes a moment.

`GLIDE_SEC` is 1.5 s — long enough that no ramp is a click, short enough that a
movement is in its own setting well inside its first bar at any tempo this file
writes.

Verified in a real browser at 300 s into a record: drone, bass, keys, drums and
ostinato all metering, no page errors. 600-record sweep: 1 throw, unchanged.

---

## §0b7 — the double kick was computed and thrown away, every bar (2026-08-22)

[owner: *"There was xero double kick pedal action going on you need to use the
web to find out how to program double kick pedal patterns. And the bass is NOT a
bassline"*]

Both true, and the first one was a bug rather than a setting.

### THE DOUBLE KICK EXISTED AT EVERY LAYER EXCEPT THE ONE THAT SOUNDS

Traced it layer by layer. The genre declared `HARDCORE_FEET`; the section's
`drumArc` carried it; the arc rebuilt the material's drums; and instrumenting
the builder showed `kickPattern? true, keep 16` at the moment of the build. The
material still came out `|x...x...x...x...|` — a quarter-note walk.

```js
      if(K.followRiff && rAcc && rAcc.size >= 2){
        ...
        kickSteps = acc;        // ← the sixteen-stroke run is discarded here
      }
```

`followRiff` **replaced** the kick bar with the riff's accents. A leg that asked
for a double pedal had it computed and thrown away on every bar of every record.

The file already had the right answer one lane down: `followRiffSnare` *"lays
riff accents ON TOP OF `snarePocket` instead of replacing it"*, because *"a
drummer catching a figure does not stop keeping time to do it."* That is more
true of the feet, not less — a double pedal **is** the timekeeping. The accents
are unioned into the run now wherever a foot pattern is declared; where none is,
the old replacement stands to the step.

```
  kick hits per second     descend 0.37   halls 0.43   deeper 2.35   return 0.33
                                                       (was 0.94)
```

### AND A RUN OF SIXTEENTHS IS NOT SIXTEEN IDENTICAL HITS

> *"With 16ths or 32nds, try having the highest value on the first note and
> descending values on the succeeding notes, like 84,70,59,44 for instance ...
> to make them more realistic and less machine-gun sounding"* [musicradar]

The old shaping was two levels — 0.9 on the beat, 0.66 off it — which is right
for a gallop and wrong for a run: every sixteenth inside a flurry came out
identical to every other one, which is precisely the machine gun the sources
name. Velocity now descends across each consecutive run and resets at every gap:

```
  one bar of the climax     0:1.00  2:0.66  4:0.90  5:0.58  6:0.49
                            8:0.90  10:0.66  12:0.90  13:0.58  14:0.49
```

⚠ I gated this on a declared foot pattern **after** the hash check refuted my
first claim that it would be byte-identical elsewhere: synthwave and fantasy
synth both moved, because a riff's accents can land on adjacent sixteenths. The
sources are all about double bass specifically, so it applies where a double
pedal is declared and nowhere else.

The sources also name a third thing not yet done: *"you don't just have to
hammer out constant 16th-notes — the effectiveness of double kick drums can be
due to the SPACES between each flurry as much as the hits"*, and alternating two
samples for left and right foot. `HARDCORE_FEET` already has gaps in three of
its four entries; the two-sample alternation is not built.

### THE BASS WAS A PEDAL, NOT A LINE

```
  before   notes/bar 1.44   STEPWISE 0%   leaps 78%   span 6.4 semitones
  after    notes/bar 4.30   stepwise 46%  leaps 39%   span 9.3 semitones
```

0% stepwise motion is not a stylistic choice, it is the absence of one. Stepwise
motion gives *"a sense of forward motion and coherence"*; a passing tone *"fills
the space between two chord tones USING STEPWISE MOTION"* and *"smooths out
leaps"*; and *"the most compelling melodies employ both conjunct and disjunct
motion"* in equilibrium [iconcollective; openmusictheory; mixedinkey].

DS2 declares the riff style with a table built **for** stepwise motion: `spice`
weighted onto degrees 1 and 3 — the two non-chord tones, the only degrees a
STEP from the root — where every table this program has carried weighted the
third and the seventh, which are chord tones, and every distance between chord
tones is a leap. Plus `approach: 2`, the passing-tone mechanism. `ownLine: 0.30`
keeps the old pedal as one option among several rather than the only thing the
lane can do.

Dungeon synth itself is untouched: still 1.44 notes a bar, 0% stepwise.

### ⚠ AND A MEASUREMENT OF MINE WAS AN ARTEFACT

I raised the bass from the parent's 0.22 to 0.50 because "the bass bus metered
0.0% live while the drums metered 140%". **The bare `bass` channel is a group
leftover that nothing routes through** — every part plays through `role|voice`,
and `bass|bass` metered **9.2%** in the same window, beside `keys|erStringsHi`
at 7.1% and `keys|mellotron` at 6.7%, both of which also read 0.0% on their bare
channels. The bass was audible the whole time and I was reading the wrong meter.
The level change is reverted and the parent's balance stands.

---

## §0b8 — one hi-hat per bar (2026-08-22)

[owner: sent the *Chop Suey!* drum chart, no words]

### MEASURED BEFORE READING IT

```
  movement    hat/bar   kick/bar   snare/bar   tom/bar
  descend       0.90      1.75       2.83       0.94
  halls         1.00      1.94       3.16       1.07
  return        0.84      1.49       1.83       1.05
```

**One hat a bar.** The parent declares `hatEvery: 16` and a bar is 16 steps, so
the loop that lays the lane runs exactly once. There is no timekeeping layer in
this kit at all — and no amount of tempo or distortion makes a record feel
lively without one, which is a large part of why every attempt so far has failed
to.

### THE CHART IS BOTH THE ARGUMENT AND THE SCHEME

Chop Suey is ♩=128 in 4/4. Its hat is the engine of the song, and what changes
between its sections is almost entirely the hat's **spacing**:

```
  E, H   straight eighths        hatEvery 2     marked mf
  D, G   sixteenth bursts        hatEvery 1     the driving sections
  C, F   dotted-eighth figures   hatEvery 3
```

That last one is free and exact. The lane is laid with
`for(s = 0; s < STEPS; s += hatEvery)`, so **3 gives steps 0, 3, 6, 9, 12, 15** —
a dotted eighth, three against four, which is the figure written at C and F. No
mechanism needed; the number was simply never used.

DS2's default is straight eighths now and each movement names its own spacing,
the way the chart does. `hatVel` comes up from 0.10 — a level chosen when the
lane fired once a bar and had nothing to sit under.

```
  movement    hat/bar before → after     kick/bar
  descend        0.90  →  5.92             1.79
  halls          1.00  →  5.71             1.95
  deeper         3.22  →  8.40             5.47
  return         0.84  →  5.42             1.53
```

Blast radius: ds2 only. 600-record sweep: 1 throw, unchanged.

### ⚠ WHAT THE CHART HAS THAT THIS PROGRAM CANNOT DO

**The two 2/4 bars** — bar 28 and bar 45, each landing immediately before a
section change, truncating the phrase by half a bar and pulling the next section
in early. It is a lot of why that song lurches.

`METRE_GRID` already holds `"2/4": { steps: 8, beats: 2 }`, but `metreOf` reads
`chart.table.metre` — **one signature for a whole record**. A 2/4 bar inside a
4/4 song needs metre per SECTION, which means the step grid, the clock, the
material loop and the roll all stop being able to assume a constant bar. That is
real surgery and it is written down rather than half-started.

Also unbuilt, from the same chart: the drums are **tacet for eight bars** and
enter at B (we have `form.build.enter`, which is a fade-in rather than a hard
entry), and each section carries its own written dynamic with a crescendo
hairpin between two of them.

---

## §0b9 — the reference parsed, and it corrected me twice (2026-08-22)

[owner: sent the *Chop Suey!* drum sheet PDF and a MIDI, no words]

The MIDI is the useful one — 9 tracks, 480 ticks/quarter, a `Drumkit` track of
1,107 notes on channel 9. Parsed all 141 drum bars.

### ⚠ FIRST, WHAT THE FILE CANNOT TELL ME

**Every velocity in it is 80.** Kick, snare, tom, crash, all one value; the hat
has two (72 and 80). It is a transcription, not a performance, so it says nothing
about velocity shaping. The descending-run velocities added in §0b7 stand on the
web sources alone and this file neither supports nor contradicts them. Said
plainly because it would have been easy to cite it as if it did.

### THERE IS NO DOUBLE KICK IN THIS SONG

```
  x...............  x42     one kick on the downbeat — the commonest bar by far
  x.....x.........  x18     0 and 6
  x.............x.  x16     0 and 14
  x.....x.....x...  x14     0, 6, 12
  x...x.....x...x.  x12
  x...x...x...x...  x10     quarters
  x.....x...x.....  x8
  x.x.x.x.x.x.x...  x1      the ONLY run in the song — one bar, a fill
```

The busiest kick bar appears **once**, as a fill into a tempo change. The
vocabulary is syncopation — 6, 10 and 14 are off-beat sixteenths — not runs.

The owner asked for a double pedal in as many words, so `HARDCORE_FEET` stays
and the climax still reaches for it. `SOAD_FEET` now sits beside it in the same
pool, weighted as measured.

### AND WHEN IT DOUBLES, THE CYMBAL TAKES OVER FROM THE HAT

The MIDI has seven tempo events: 136 BPM, then 272, then back, alternating.
Split the bars by region:

```
  region     bars   kick/bar   hat/bar   snare/bar   crash/bar
  136 BPM     59      2.29       5.22      0.86        0.17
  272 BPM     82      2.12       1.66      1.34        1.32
```

**The hat gets sparser and the cymbal takes over. The kick barely moves.** That
is a drummer coming off the hi-hat and riding a cymbal, and it is what makes a
fast section sound *bigger* rather than just busier — a hat played fast is a
hiss; a cymbal is a beat you can still hear at speed.

**This reverses §0b8.** I had read the photographed chart's D and G sections as
"sixteenth hats in the driving parts" and set the climax to `hatEvery: 1`. The
MIDI says the opposite. The climax now rides on 1 and 3 —
`x.......x.......`, the single most common cymbal bar in the reference at 46 of
141 — and its hat drops to the same two positions instead of climbing to sixteen.

`rideEvery` is the right mechanism: the crash lane here is an **arrival** marker,
one per loop, and its own note says *"a crash on every bar is a cymbal wash,
which is a different instrument."* Riding a cymbal on the beat is what
`rideEvery` was built for.

```
  movement    kick/bar   hat/bar   snare/bar   ride/bar
  descend       1.79      5.92       2.95       0.00
  halls         1.95      5.71       2.85       0.00
  deeper        2.85      3.95       2.68       0.71
  return        1.53      5.42       2.45       0.00
```

Blast radius: ds2 only. 600-record sweep: 1 throw, unchanged.

### STILL NOT BUILT

The **2/4 bars** (chart bars 28 and 45). The MIDI does not encode them — it
carries one time-signature event, 4/4 at tick 0 — so the PDF is the only source
for them and §0b8's note stands: metre is read once per record, and per-section
metre is real surgery.

---

## §0ba — the toms are the kit, and the copied patterns are out (2026-08-22)

[owner: *"We do not want to COPY! We also are not that intersted in high hats.
We are interested in TOMS"*]

Both halves are corrections to me.

### THE COPIED MATERIAL IS REMOVED

`SOAD_FEET` — a kick vocabulary counted straight off someone else's record — and
the ride-on-1-and-3 lifted from the same file are gone. Measuring a reference
carefully does not stop it being copying; it just makes it accurate copying. The
findings that came out of parsing it stay in §0b9 as *reading*, which is what a
reference is for.

### AND THE HAT WAS THE WRONG INSTRUMENT FOR THE RIGHT FINDING

Two builds running I put a hi-hat engine in, on the finding that this kit had no
timekeeping layer. **The finding was right and the instrument was wrong.** The
toms are the timekeeping layer in this genre and always should have been — the
owner has said so twice before: *"the toms take front role and lead"*, *"our
genre focuses on the toms not the snare"*.

MEASURED before this — the toms were the **least used lane in their own kit**:

```
  movement    TOM/bar   hat/bar   kick/bar   snare/bar
  descend      1.02      5.92      1.79       2.95
  halls        1.25      5.71      1.95       2.85
  deeper       1.78      3.95      2.85       2.68
```

Two reasons, both in the table and neither in the code:

- **`loopBars: [1, 3]`** — toms fire on two bars of four.
- **Every tom shape lives in steps 6–15**, the back half of the bar. They were
  written as an *answer at the end of a phrase* — which is what the comment above
  them says, and which is true of a kit with a hi-hat on it and false of a kit
  whose front line is three taiko.

### AFTER

Toms play every bar, and the figures run across the whole bar instead of leaning
into the next one. Written for this genre rather than counted off a record: a low
drum keeping the pulse with the mid and high answering it, which is what a
marching drum line does and what this genre's war-drum palette was built for.

```
  movement    TOM/bar   kick/bar   snare/bar   hat/bar
  descend      3.79      1.76       2.76       1.57
  halls        3.84      1.98       3.43       3.23
  deeper       3.64      5.14       2.66       2.23
  return       2.73      1.48       2.39       1.38
```

And what a bar actually is now — the tom lanes written as 3/2/1, low to high:

```
  bar 0   toms |3...3.2.3...3.2.|   kick |x...x...........|   hat |x.......x.......|
  bar 2   toms |3..2..1.3..2..1.|   kick |x...x...........|   hat |x.......x.......|
```

The hat drops to two strokes a bar — present, marking the beat, not the engine.
The one hat setting kept from the last build is `hatEvery: 3` in `halls`, and it
is kept as a **spacing** rather than a borrowed figure: 0, 3, 6, 9, 12, 15
against a four-beat bar is three against four, and this genre's own figure lane
already runs seven against four.

The double pedal stays in the climax — the owner asked for it directly — and the
tom roll lane comes up with it.

Blast radius: ds2 only. 600-record sweep: 1 throw, unchanged.
