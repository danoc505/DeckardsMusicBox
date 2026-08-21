# THE BACKLOG — everything this project has said needs doing

*Collected 2026-08-03 at the user's request: "let's build a doc that
collects everything we are saying needs to be done or should be done."
Until now these lived scattered through HANDOFF-MK2.md session entries and
the research files, which is where intentions go to be lost.*

**HOW TO READ THIS.** Every item says WHY it is open and WHAT would close
it. Nothing here is a wish: each one was found by measurement or named by
a source. Items are grouped by what they cost, not by when they appeared.

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
