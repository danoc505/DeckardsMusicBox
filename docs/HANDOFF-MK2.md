# HANDOFF — Deckard's Orchestrator MK2

> **Starting a fresh session? Read `docs/START-HERE.md` first** — the branch,
> the rules, the current state and what to do next, in two pages. Then come
> back and read this whole file, which is the contract.

*⚠ **CURRENT AT `2026-08-10d` — DUNGEON SYNTH HOLDS ITS NOTES, MOVES ITS FX,
AND GETS ITS WEATHER.** Four slices in one day of dungeon synth work, each
measured, each from the owner's own list ("legato where needed, the correct
audio levels, the correct low mid, highs... all the instruments in the Errang
set... more of the FX sounds"): legato on the tune and second keyboard (the
tune rang 0.82 s then left 1.77 s of silence on a 0.55 s-attack machine; +3.5 dB
of ring after); a −3 dB desk low shelf (the record carried 66–75% of its energy
in one octave band against the pack's own 330–656 Hz centroids — after: centroid
193→332 Hz, drum crest improved, march still loudest by 11 dB RMS); gestures on
the recurring `fill` trigger plus a room-and-echo `matrixDraw` pool (the genre
declared ZERO gestures while fills recur 7–10 a song — the 10a lesson,
unapplied); and the pack's ten unplayable sfx/Noise files now play — eight
loopable beds drawn one per song on the tape role's rail at a measured
−38.9 dB, two one-shots as a peak accent, **all 65 Erang sounds reachable**.
Twice a number was tried and the measurement refused it, and both are recorded:
the bass fader (+2.7 dB moved the drone's leave-one-out from −0.01 to −0.01 dB
— register physics, not gain) and the first bed level (−45 dB, the "declared
and absent" defect in audio form). Snapshot moved 600 of 5400 lines, every one
dungeonsynth, note-hash unchanged. `docs/genre-research/dungeon-synth-fx-and-balance.md`.*

*⚠ **`2026-08-10b` — THE FIGURE ARRIVES IN THE FIRST MINUTE, AND THE
WORD "EARS" IS OUT OF THIS REPO.** Two things, both asked for directly.

**One: prog-techno's own subject was a minute late.** `probe_stems` reads the
first seventy seconds, and in them the seven-note cell the whole genre is built
on contributed **0.86 dB** against plastikman's 3.57, on 42 notes against 105 —
the opening was drums and almost nothing else. Not the material (the roll has the
figure from bar one of A) but the arrangement gate:
`form.build.enter.ostinato` was `[0.11, 0.07]`, which on a 538-second record is
**59 to 97 seconds** before the genre's subject appears. Now `[0.04, 0.04]`.
Measured after: **161 notes and 3.36 dB**, level with plastikman's 3.57, and the
drums drop from 6.39 to 2.18 — the same balance, not a louder record. It still
ENTERS; it enters where somebody is still paying attention.

**Two, and it is a standing rule now: THIS REPO DOES NOT TALK ABOUT EARS OR
LISTENING.** The owner has corrected this four times and the words kept coming
back, so they are gone rather than discouraged. `test/ears/` is **deleted**. The
`[EAR]` notation — 554 of them across 55 files, meaning "chosen by me rather than
taken from a source" — is now **`[CHOSEN]`**, which is what it always meant. Every
`NOT HEARD` tag, every "listening brief", every "the honest next step is a
listen" is gone. `kit.listen` is **`kit.answer`** (the feature's own write-up
already called it *"a lane that answers another lane"*), and
`the-part-that-listens.md` is `the-part-that-answers.md`.

**What was deliberately NOT changed, so nobody re-does it:** `addEventListener`
(79 of them — a browser API, not ours), and
`docs/genre-research/raw/ds-research-2026-08-06.json`, which is a **verbatim
capture of external sources**; editing what a source said to remove a word would
falsify the research. Everything else in the repo is clean — the check is
`grep -rliE '\bears?\b|\blisten' --include='*.md' --include='*.js' --include='*.html'`
outside `node_modules`.

**The rule the words were carrying still stands and is written without them:**
this program cannot judge how anything sounds. Measurement and research are the
only way it improves, the owner is the only judge, and "wait for a verdict" is
never a next step to propose.*

*⚠ **`2026-08-10a` — THE SWEEPS ARRIVE, AND NINE SENDS THAT WERE
NAILED OPEN NOW MOVE.** The owner: *"Your not doing anything with the fx. Your
not building sweeping motions quick nor long movement. Its all wrong, the song
takes so long to get into anything."* Two faults. **One:** every gesture was
written on `peak` or `build`, which both key off the single apex — so each fired
ONCE in eleven minutes, while `fill` recurs 9.8 times a song and nothing used it;
free LFOs swung the hat filter 7000 Hz a minute, motion without direction. Now
the arc climbs 0.30 → 0.89 instead of sitting at 0.13, the record is ~9 minutes
rather than 11.5, and prog-techno has more deep-swinging lanes than plastikman
(19–24 at ≥35% of dial, against 12–19) on two thirds the lane count.
**Two, and it is the one to inherit: A SEND MATRIX CROSSING IS A SWITCH BEFORE
IT IS A KNOB.** Routed is 1, unrouted is 0, and motion is an ADDITIVE offset —
so **a routed send can only be played DOWNWARD.** Nine lanes across four genres
pushed up against a rail and travelled as little as 0.00% of their dial in every
song ever made. **Nothing in the harness could see it:** the range check tested
`clamp(x)` against the range the clamp enforces, and both the swing check and
`probe_automation` measure the OFFSET rather than what the voice reads. New
check measures `clamp(base + offset)`; the file's floor is now 36%. The generated
`matrix.<bus>Room` lane is fixed at the generator, not per genre. **300 of 2700
songs moved, all prog-techno; the snapshot does not hash motion at all, which is
a gap now written down.** BACKLOG §0e.*

*⚠ **`2026-08-09f` — A NINTH GENRE, prog-techno.** "Pink Floyd
crossed with punk wrapped into a techno back bone", in the owner's words. The
finding it is built on: Cohen's account of Pink Floyd's "Dogs" -- "a small amount
of material... expanded enormously by heavy repetition and an exceptionally slow
harmonic pace" -- is a description of a techno track written about a prog record,
so the two are one strategy rather than two to reconcile. A locked groove, a
seven-note figure that walks against the bar and is ACCENTED when it comes home
(`sam`, from tala and the gamelan gong), and a solo that plays nothing for the
first third and then arrives (0 lead notes early, 256 after -- Cohen: the solos
"outline the contour in energy level of the song... leading it to its peak").
**Both mechanisms already existed** -- `ostinato.run` and `form.arc.thin` -- and
one baked-in constant had to go: `const BARS = 4`, the material length, now
`materialBars`. **THE FULL 2700-SONG SNAPSHOT WAS IDENTICAL** before the baseline
was rewritten for the new genre. The battery caught nine things and was right
every time; four were my table and three were check premises stale in the same
way the hardcoded section length was. `docs/genre-research/prog-techno.md`.
**It does NOT yet break any rule** -- probe_theory reads it 0.0% out of key, and
punk-as-rule-breaking is §G, deliberately left for the next slice.*

*⚠ **`2026-08-09e` — YOU SET HOW LONG THE RECORD IS.** A dial on the
transport, 1:00 to 20:00, on every genre; the song is BUILT to that length,
keeping its intro, its build, its peak and its outro, rather than cut to it.
Worst miss over 8 genres x 5 lengths x 4 seeds: 31 seconds. **And it exposed a
principle-1 violation that had been in the program the whole time:**
`form.lengths` is ONE HARDCODED NUMBER per function, so the shortest dungeon
synth record was about seven minutes — and the first version of this work wrote
that down as a FLOOR, as though a baked-in 16 were a fact about music. The
owner: *"Bullshit! A song can be any length if weve coded it to be so ridged its
fixed to one length weve done something very wrong!"* Section length is a
constraint now: dungeon synth's shortest went 6:45 → **1:42**, jungle 4:48 →
1:08, bladerunner 3:32 → 1:26, acid 3:09 → 0:47, and a seam check fails if any
genre's floor climbs back over two minutes. **THE FULL 2400-SONG SNAPSHOT IS
IDENTICAL** — this restructured `makeForm`, which is the one job the full sweep
exists for. `docs/genre-research/NOTES-FROM-THE-USER.md` has the correction and
the principle behind it: *"i cant make music this app is meant to do the stuff i
cant do. But i want to be able to do things and set things."**

*⚠ **`2026-08-09d` — and every part of a blend can be AIMED at a
genre.** §H step 3. Each element the blend decides carries a control — *whichever*
or *always <genre>* — and **594 element-and-genre combinations across all 28
pairs are honoured**. A pin is settled before the dealing, like an element only
one genre declares, and the quota balances the rest around it: one element pinned
still leaves the record within half an element of the fader's share over 84
songs. A pin OUTRANKS the fader on purpose. An impossible pin is refused in
words. Read it in the notes with `mk2_roll --trait kit=jungle`, which is new for
exactly that reason. **Two corrections from the owner came with it and both are
in NOTES-FROM-THE-USER:** the unjudged pile is not a stop sign (*"YOU CANT JUDGE
YOUR NOT A HUMAN! You can print midi notes and read them!"*, and §0 has said so
since 2026-08-04), and their three fader sentences are EXAMPLES rather than a
checklist. `docs/genre-research/breaking-the-rule.md` §9.*

*⚠ **`2026-08-09c` — the genre sliders mean what they say in every
song.** `BACKLOG.md` §H step 2. The owner called the faders *"our chief rule
breaking tool"* and said they were *"quite blind and limited"*. They were: every
element tossed its own coin, so thirty songs averaged out and no single record
had to. **Worst single record across 28 pairs: 8/92 before, 45/55 after. Each
pair's worst record: 31 points off half before, 2 after** — and the two are
arithmetic, because an odd number of elements will not divide in two. The
elements are DEALT now: a shuffled order, each to whichever genre is furthest
behind its share, and the elements only one genre can supply dealt FIRST so they
cost that genre what they are worth. The quota decides how many, the shuffle
decides which, so two 50/50 records are both half and half and are different
records. `deal again` on the blend panel rerolls the hand; the panel says what
the record actually came out as, in words.
**The gate held and it is structural, not sampled:** a blend of one genre returns
its plain table before the allocator exists, so a solo genre cannot reach it —
200 songs IDENTICAL. Numbers, method, and the three defects the new measuring
tool found on its first day (the second voice split down the middle in 73 of 120
songs; the genre's own name dealt a share and thrown away; four send lists whose
words claimed a grouping the code never had) are in
`docs/genre-research/breaking-the-rule.md` §8.*

*⚠ **`2026-08-09b` — the drums change from section to section.** The
largest open item in `BACKLOG.md` is built: a section's drums are now the genre's
kit plus a ladder of MOVES, the rung set by how far into the record the section
sits, and the closing section takes the biggest change in a drawn direction. It
was measured first — a record had six to fourteen sections with drums and three
or four drum parts, and four genres closed on a drum part already heard in 100%
of songs. All seven genres with drums moved, 25 of 25 seeds; Blade Runner did
not, because it never plays drums — it composes a kit and `drums` is active in 0
of 594 sections across 60 songs, so no drum event reaches the performance.
`docs/genre-research/drum-sectional-arc.md` has the sources, the numbers and the
two things that were built and then removed by measurement.*

*⚠ **AND THE UNJUDGED PILE IS NOW TWENTY-ONE.** The 2026-08-08 run was nineteen
builds, `08a` through `08s`, ending with the roll becoming editable; `2026-08-09b`
made twenty, and `2026-08-09c`, `09d`, `09e` and `09f` make twenty-four. That is not a
footnote: this program's own first rule is that measurement can prove a thing
exists and only the owner can say whether it is good. `2026-08-09b` is the
one build in that stack aimed at a complaint the owner made in their own words,
so it is the one worth playing first; the open taste questions are in the backlog.
Whoever picks this up should weigh "build the next thing" against "help him hear
the last twenty".*

*Written 2026-07-29 on branch `claude/code-review-6jd9cz` at `02906b7`; revised
at `077e08b` when the rack reached the conductor; revised again 2026-07-30 at
`4728512`, after the control sweep and the non-chord-tone law. **Revised again
2026-07-31 at `7c7644b`** — the sax learned to phrase, the rack became a list,
minimal techno got its polymeter and something that answers, and eight
rendered-audio failures that had been dismissed as "pre-existing" turned out to
contain two real defects in the music. **Revised again 2026-08-08 at `08g`** —
the tape machine, the legato (a switch, then a genre door), the desk onto the
master strip, the bass unit's one face with all five engines answering its
knobs, the bus compressor with its needle, and the spring tank. Six of those
are AUDIBLE changes nobody has judged; the "WHAT 2026-08-08 BUILT"
section below carries the numbers. For whoever picks this up next. Read this
whole file before you touch the HTML.*

**THE COMMANDS. Each one in its DEFAULT form, which is the form to use.** Where
a tool has a `--full` sweep it is named here so you know it exists — reach for
it when the question needs it, not by habit.

| battery | command | what it answers |
|---|---|---|
| the notes | `node harness/mk2_roll.js 1 --genre <g>` | **RULE ONE, not optional** — the notes, before and after |
| seam checks | `node harness/mk2_test.js` | the laws. A trailing word is a NAME FILTER: `mk2_test.js kit` runs the checks whose names contain it and says how many it skipped |
| snapshot | `node harness/mk2_snapshot.js check harness/mk2_baseline.snap` | did the music move? Samples seeds by default, matched per (seed, genre); `--full` sweeps the whole baseline |
| UI, in a browser | `node harness/mk2_ui.js` | the front panel, driven for real. `--full` adds the two long ones (graph growth, declared-vs-drawn). Flaky ~1 in 5 — see below |
| blend sliders | `node harness/mk2_blend.js` | the X/Y/Z blend |
| MIDI port | `node harness/mk2_midi.js` | the `.mid` export and the live port |
| the mixer | `node harness/probe_mixer.js` | the desk reaches the graph |
| balance, in the audio | `node harness/probe_stems.js <g> <seed> [secs] [from]` | levels, A-weighted, crest, gap, leave-one-out |
| how static a record is | `node harness/probe_static.js <g> [songs]` | parts sounding at once, distinct bars |
| which sounds get used | `node harness/probe_palette.js <g> [songs]` | switch positions and machines per slot |

*The run times that used to be in this table are gone on purpose. They were
measured once, went stale, understated the worst case badly, and reading them
is what talked me into paying them. Ask the tool, not the table.*

### THE TESTING RULE, CORRECTED 2026-08-07 — READ THIS BEFORE THE TABLE ABOVE

The instruction used to be "run all of these before you claim anything". That
is why one session ran the whole chain **eight times** for a day's work and the
user paid for it and told me to stop. It is replaced by:

- **FIRST, ASK WHAT CAN SEE THE CHANGE.** Most checks cannot see most changes.
  `mk2_snapshot` hashes the NOTES, so a label, a colour, a panel layout or a
  select cannot move it — running it on a UI change is a diff against a file
  you already know is identical, and reporting "not one note moved" afterwards
  is a sentence that was true before you started. The table in
  `START-HERE.md` maps what you touched to what can see it. **Say which check
  you skipped and why**; that is worth more than a green line.
- **While working:** `mk2_roll.js` and `mk2_test.js` only, and prefer the
  targeted form — a name filter on the battery, or a five-line query against
  the composer, when the question is about one seam.
- **Once, before publishing:** snapshot, ui, blend, midi, and any probe the
  change touches. One browser at a time — a combined run has been killed for
  memory (exit 137).
- **Never** the whole chain after every edit.
- **Never a `--full` sweep by reflex.** Every tool that has one defaults to the
  cheap form deliberately. Reach for `--full` when you can say what it would
  see that the default cannot — a rare interaction across many seeds, a leak
  that only shows over time — and say that out loud before running it.

**AND THE REASON THIS RULE KEEPS GETTING BROKEN, WRITTEN DOWN.** It is not
forgetfulness. It is that a large edit leaves you not knowing what you broke,
so you reach for a battery to find out. **The fix is smaller edits**, finished
one at a time. The session that wrote this rule broke it within the hour.

### AND THE BATTERY CANNOT SEE MOST OF WHAT MATTERS

Every complaint the user made on 2026-08-07 — drums inaudible, then smeared,
chords buried, roll unreadable, **the mixer with every control dead** — was
invisible to a green battery. Three lessons, each paid for:

1. **A probe that reaches past the interface only proves what is behind the
   interface.** `probe_mixer.js` passed 4/4 while every fader and knob on the
   panel did nothing: it called `MK2.setMixer` directly, and the panel's own
   push went through `window.Sound`, which is `undefined` because `Sound` is a
   `const` and const never lands on `window`. **For anything with a knob, the
   check that counts is the one in `mk2_ui.js` driving the real element with
   real pointer events.**
2. **A probe can be measuring a different program than the one that plays.**
   `probe_stems.js` rendered with no space, no kick voicing, no drum drive and
   no motion, and `chTune` returns 1 flat on a graph with no drum machine — so
   the war drum's tuning was OFF in every reading it had ever printed, and a
   round of drum changes came back "identical to the decimal".
3. **RMS is not loudness.** The drums measured -13.6 dB and **-39.9 dB
   A-weighted** — the largest thing in the record by power and inaudible.
   Balance questions go through the A-weighted and MISSED columns, never plain
   RMS.

### WHEN A CHECK GOES RED, DECIDE HONESTLY WHICH IS WRONG

Three times on 2026-08-07 the check's PREMISE was stale rather than the
program: the polymetre check inferred a period per lane and phrasing destroyed
that inference; the syncopation check held every bar to a downbeat kick
including the one bar whose job is to remove it; a new check asserted
repetition genres have identical bars, which they never did. Each was rewritten
to measure the thing it was about — reading `kit.poly`, exempting D bars **by
name** from `materials.drumPhrase` — and never by moving a threshold. Say in the
commit message which you changed and why.

### WHAT 2026-08-08 BUILT — `08a` … `08s`

- **`08s`** THE HAND ON THE ROLL. The user: *"a function that allows a user to
  select a part of the piano roll and reroll or edit it and the rest of the song
  dynamically adjusts."* Click a note; every note that part plays in that
  section lights; a bench offers **reroll · thinner · thicker · 8ve up · 8ve
  down · reverse · delete**, and **undo**.
  **THE OWNER'S RULE, ASKED BOTH WAYS, WAS "THE LEAST NECESSARY CHANGE"**, and
  everything follows from it: reroll the bass in section 5 and only section 5's
  bass changes -- that section gets a PRIVATE COPY of its material (`A@5`), the
  same machinery the key shift already uses.
  **AN EDIT IS AN INPUT, NOT A PATCH.** `chart.edits` sits beside `chart.pins`,
  which this file already calls "an input on exactly the same footing as picks,
  never an override applied later". The song is COMPOSED AGAIN from (seed,
  genre, tables, pins, edits) -- so it stays a pure function of its inputs, every
  seam check still runs on it unrelaxed, and **undo is `pop()`**, which cannot
  drift or leave half an edit behind. An edited song composes TWICE: the hand
  points at a section, and which material a section plays is stage 4's decision,
  so rather than let stage 3 guess at it the song runs through once to find out
  and again with the answer.
  **AND MY "SAFE BY CONSTRUCTION" CLAIM WAS WRONG, caught by the seam check on
  the first run.** `thinner` and `reverse` both threw: legality is a property of
  a note AND ITS NEIGHBOUR -- an out-of-key passing tone is legal because of what
  FOLLOWS it, so removing or reordering its neighbour strands it. **Removing
  notes can make the remaining ones illegal without touching them.** The law was
  lifted out of the seam check into `noteFits`, one owner and two callers; the
  edits ask it and drop what they have orphaned. A change that still will not
  compose is refused and says why, rather than the law being loosened.
  **TWO LEAKS FOUND BY MEASURING, both the same defect this file keeps catching
  -- a hand-kept list beside the thing it lists**: `drumPhrase` had no entry for
  `A@0` so the kit lost its phrase letters, and `ALT_OF["A@0"]` was undefined so
  the section lost its four-bar A/Avar alternation. Three drum events were moving
  in a song where only the bass had been edited. Both derived now, and the edit
  applies to the alternate too.
  **MEASURED**: delete the bass in section 0 -> two materials ADDED, none
  changed, 22 bass events lost, 0 gained, nothing else moved. Snapshot
  **IDENTICAL across 2400 songs** -- an unedited song is byte-for-byte what it
  was. Driven in a real browser: 1225 notes, one click selects the 23 that part
  plays there, every button moves the song, undo x6 returns to exactly 1225, no
  page errors. 149 pass, UI 66 pass, blend 12 pass.
  **NOT DONE, deliberately**: edits do not save and the exports do not carry
  them -- *"Slice 3 not needed at this time, this is a future concern."* And the
  edits are not recorded anywhere I can read, so they cannot yet become table
  changes. **Unheard.** `docs/genre-research/the-hand-on-the-roll.md`.

- **`08r`** THE OWNER REVERSED ME ON THE BASS, AND THE FILLS WERE LOCKED BEHIND A
  CHORUS. Two verdicts from the owner, both of which outrank the measurements.
  **(1) THE BASS.** *"The plastikman bass is wrong … I feel like he uses echo to
  get more notes. We have too much bass and not enough fx."* `08q` had read that
  bass as too root-bound and opened it up; the numbers moved as intended and the
  RESULT is wrong, because I answered a question about TEXTURE with a change to
  PITCH. **The answer was already in the repo in the user's own words** — "we can
  start with ONE BASS NOTE and fill in the silence with reverb, delay etc. and
  build up around that. It's maximising the minimal." I had that sentence and
  built its opposite. Every number reverted (`distinctPitches` [2,2],
  `rootShare` 0.62, pool 58% root — measured back to 79.2% / 62.5% / 1.70).
  `roleGain.bass` 0.62 → 0.50, which is the half of the verdict I can move
  without hearing. The echo's own feedback and mix are NOT touched: the bass is
  already fully sent to the delay, so that half is a wet/dry judgement and needs
  a verdict.
  **(2) THE FILLS, AND IT WAS ONE CONDITION.** *"We never have fills or solos or
  drum rolls! It's often just one single drum loop the whole song."* Measured: a
  fill fired only when the NEXT section happened to be a chorus or a bridge --
  **plastikman 0.3 fills a song, one every 933 bars; synthwave one every 66;
  acid one every 97; Blade Runner never.** This repo's own `rhythm-phrasing.md`
  §2 says a fill belongs at the end of a PHRASE, to "increase the energy in
  anticipation of the next phrase's downbeat", and says nothing about choruses.
  Unlocked to any section that has drums and is followed by another: **fills a
  song 0.3 → 7.6 (plastikman), 1.8 → 12.8 (synthwave), 2.6 → 7.6 (acid), and
  every genre with a kit now gets one every 9-35 bars.** Blade Runner stays at
  zero, correctly -- it has no drums.
  **NOT DONE, and it is the larger half of the drum report**: sections that add,
  take away and alter, with the LAST carrying the most change. The phrase letters
  (A/B/C/D) exist per material; what does not exist is a section-scale arc of
  subtraction and addition. Researched next.
  Notes byte-identical in seven genres (only the arrangement moved, which is
  where a fill belongs); plastikman moved on the bass revert. 149 pass.
  **Unheard.**

- **`08q`** THE BASS THAT HAD ONE JOB — AND THE TWO NUMBERS THAT WERE THE REAL
  FAULT. Fourth of the five, and **it opens with a citation I had not checked.**
  Item 4's whole case rested on a quote about bassists being free to "pedal a
  single note, play ostinatos, or engage in melodic conversation", which I
  attributed to The Sound Atlas and called "the whole diagnosis in one quote".
  **Fetched, that page does not contain it.** The claim is real and corroborates;
  the page does not hold it. The source that IS fetched and is sharper:
  Audiofanzine, "Pedal and ostinato in the modal system" -- a pedal is "one or
  two notes throughout several continuous chords", an ostinato "a motif or
  phrase … made up of several short notes", and "you can usually use both at the
  same time". Corrected in `static-harmony-and-evolution.md` over my name.
  **THE GAP WAS REAL AND IT WAS NOT THE FAULT.** `bassRoles` (a weighted list
  drawn per MATERIAL, so A/B/C each ask what the bass is doing) is built and
  guarded. Then measured: minimal techno as `[["acid",5],["drone",3]]` got
  **WORSE** on the exact axis complained about -- root 79.2% → 80.8%, distinct
  pitches a bar 1.70 → 1.51 -- because the drone role is 100% root by
  construction. A second way to pedal is not a cure for a bass that pedals
  because it cannot do anything else. Removed.
  **THE TRASH BASSLINE WAS THREE NUMBERS IN ONE TABLE**: `distinctPitches [2,2]`
  against acid house's `[3,2]`, `rootShare 0.62` against 0.45, and a degreePool
  58% root against 43%. **Two of them I set myself and marked `[CHOSEN]`** -- which
  in this project means MY OWN judgement of sound, which I do not have; the owner does, and his
  verdict was "the bassline is trash". Density stays [3,6] and tieChance stays
  high (both the user's own asks). **Result: root 79.2% → 62.2%, repeats own
  note 62.5% → 40.2%, distinct a bar 1.70 → 2.27** -- no longer the most static
  bass in the file, still sparser than acid house.
  **AND `bassRoles` HAS NO USER, WHICH IS STATED RATHER THAN HIDDEN.** Dungeon
  synth crashed on it (`riff` reads a `bassRiff` table it has never had -- the
  guard now filters a role a genre cannot play, derived from the genre); lofi
  was not taken because its bass is already the second healthiest in the file
  and a pedal role would repeat the §2 mistake. Which genre should get a second
  role is a taste question. plastikman 20 lines on seed 1, every other genre 0.
  One MIDI battery run failed and passed 20/20 on re-run -- a flake, named.
  **Unheard.** `docs/genre-research/bass-roles.md`.

- **`08p`** TWO COPIES OF ONE MOVEMENT, ONE SLIGHTLY SLOWER. Third of the five,
  and **the claim I opened it with was substantially wrong.** I wrote that
  nothing here drifts because every lane was locked to a tidy 16/32/64-bar grid.
  Measured over 30 songs a genre, every pair of `lfo` lanes, asking whether the
  pair ever returns to where it started inside one record: **dungeon synth 96%
  never do, lofi 92%, vgm 89%, synthwave 83%, Blade Runner 68%, minimal techno
  58%, jungle 26%, acid 16%.** Six of eight genres were already aperiodic.
  **APERIODIC IS NOT PHASING.** Reich's sentence has four conditions, not one:
  *"Two musicians begin in unison playing the same pattern … the other gradually
  increases his or her tempo so as to slowly move one beat ahead … until both
  players are back in unison"* [Wikipedia, "Piano Phase"]. Same pattern, in
  unison, nearly the same rate, and RETURNING. Seventy-seven unrelated movements
  satisfy none of the other three. Measured: destinations anywhere in the file
  carrying two lfo lanes inside a 1.35 ratio — **zero, in all eight genres.**
  **THE BUILD** is a phase twin: same shape, same depth, same starting phase, a
  few percent slower, pushed onto the same destination, where lanes already sum.
  Both draws are the last two on that lane's own throwaway stream, so a genre
  that declares nothing computes exactly the lane it always did.
  **THE ARITHMETIC THEN REMOVED TWO OF MY FIVE CHOICES.** A beat completes in
  `bars / detune`. Realised medians against the records they must fit inside:
  minimal techno 346 bars/264 (1.3×) KEPT, jungle 184/291 KEPT, acid 195/250
  KEPT, **dungeon synth 805/162 (5.0×) REMOVED, Blade Runner 762/80 (9.5×)
  REMOVED** — both have movements as long as their records, so a pair traverses
  a tenth of its beat and stops. I had written both declarations with reasons I
  believed before the numbers arrived.
  **OF THE THREE THAT STAYED, ONE IS SOURCED AND TWO ARE JUDGEMENT CALLS**, and
  the tables say so in their own comments: minimal techno is Reich → minimalism
  → the user's own "more like generative modular"; **acid and jungle are on a
  staleness MEASUREMENT, not a source** (the two most locked genres in the file),
  and are the user's to overrule.
  **PROVED, against a same-build control**: `dp4.aLvl`, seed 3, base 46 bars,
  twin 51.5 (11.9% slower), beat 385 bars in a 304-bar record. Swing per 30
  bars runs **0.210 → 0.272 → 0.023 → 0.130 returning**, against a control that
  sits flat at 0.15 all record. **Every note in the file is untouched** —
  snapshot byte-identical across 2400 songs, correctly, because motion never
  moves a note. **Unheard.** `docs/genre-research/phasing.md`.

- **`08o`** ONE PART ANSWERS ANOTHER. Second of the five, and it starts with a
  **correction of my own claim**: I said call and response was absent from the
  whole program, and the tune has been asking and answering itself for weeks --
  `phrase(0, dir, true)` then `phrase(2, -qDir, true)`, commented "the answer:
  contrary, resolving", a textbook antecedent and consequent. What was absent is
  one part answering ANOTHER, which every source treats as the primary case:
  *"a second player answers"*, *"responses often occupy the musical gaps created
  by the initial phrase"* [Wikipedia]. Ethan Hein on "So What": *"Each bass riff
  is a call; each piano/horn riff is a response"* -- the unit is a riff, not a
  note. A parallel period's consequent *"reproduces the basic idea note for note
  before diverging"* [Open Music Theory].
  **MOST DOORS WERE SHUT, AND THAT IS THE INTERESTING PART.** Measured, every
  genre leaves 4-8 free sixteenths a bar, so there is room everywhere -- but
  **four of eight have no second voice at all**, and they are exactly the four
  in this device's own lineage (lofi, jungle, acid, plastikman; the tradition
  *"permeates jazz, soul, gospel, blues, rhythm and blues, funk, and hip hop"*).
  Each `counter: null` is a researched decision with the user's own report
  behind it. Adding a voice back to make a feature audible would be the
  measurement fitting the claim, so I did not. **And no source was found for
  call and response in the game-music genres**, searched for specifically, so
  vgm did not get it either.
  **DUNGEON SYNTH IS SOURCED AND ALREADY HAS THE PART.** Antiphony is *"two
  halves of the choir alternate singing … half lines of psalm verses"*,
  responsorial is *"soloist alternates with choir"*, form R V1 R V2 … R
  [Britannica; Catholic Encyclopedia]. This genre's modes came off a dungeon
  synth score and its bass pedal is the mode's finalis and tenor out of medieval
  performance practice -- the same body of practice, not an import.
  **`style: "answer"` CHANGES ONE THING: WHERE THE NOTES SOUND.** Every pitch is
  still chosen by the same machinery. A `line` puts each note on the tune's
  note; an `answer` moves the whole bar's worth into that bar's largest silence,
  keeping their spacing. And `density` gates the CALL, not the note -- measured
  with the per-note gate, placement worked (silence 38% → 68%) and gave ONE NOTE
  PER BAR, which is not a phrase. **Result: silence 38% → 68%, 1.9 notes an
  answer instead of 1.0, 262 notes against 264 -- the same amount of second
  voice, differently placed.** dungeon synth 220/300 seeds; every other genre
  0/300. The battery check that reads counter density was taught the style's
  unit rather than relaxed. **Unheard.**
  `docs/genre-research/call-and-response.md`.

- **`08n`** THE RECORD CHANGES KEY IN THE MIDDLE AND COMES HOME. First of the
  five gaps the user asked for in order: *"Work on the 5 things you mention …
  Do all 5, start with the first and work your way down."* A mode was drawn
  once, per SONG, so a nine-minute minimal techno record was one scale for nine
  minutes — and that genre's own bridge table said `/* there is no departure.
  Same drone, so C cannot leave home. */`.
  **THE DEVICE HAS TWO PARTS AND THE SOURCES DISAGREE USEFULLY ABOUT BOTH.**
  Milestones is *"G Dorian for 16 bars, A Aeolian for another 16 bars, and then
  back to G Dorian"* — tonic +2 AND the mode changes, and those two scales share
  **6 of 7 notes**. So What is *"sixteen bars of D Dorian, eight bars of E-flat
  Dorian"* — tonic +1, mode held, and those share **2 of 7**. Same composer,
  fourteen months apart, opposite ends of one dial. `keyShift` is that dial;
  minimal techno and dungeon synth declare it, weighted toward the gentle end.
  Which mode a shift may move INTO is derived from the genre's own bridge table,
  so nothing can go stale.
  **THE FIRST BUILD DID NOT REACH AND THE MEASUREMENT SAID SO.** On the bridge
  alone — where both sources put it — it fired on 171 of 300 records and was
  HEARD on 37, because a bridge is optional here (21% of forms; dungeon synth,
  4 in 300). The sources' B section is not optional. So the main material is
  built TWICE at stage 3, same stream names, and stage 4 chooses: **rhythm
  identical, every part a clean +2**, a restatement rather than a redraw. Now
  **171/300 move and 171/300 play it, 15.6% of all bars — 27% of the bars of a
  record that moves, against So What's 25%.** The other six genres: 0/300, and
  all eight seed-1 rolls byte-identical for the refactor alone.
  **A KEY CHANGE IS A GOOD TEST OF WHETHER A PROGRAM KNOWS WHAT KEY IT IS IN.**
  Eleven places counted scale steps against the SONG's tonic while claiming to
  count them against "the key" — the bass's chromatic approach and octave walk,
  the comp's inner-voice neighbours, six reaches in the tune, the counter's
  intervals. All correct for exactly as long as a song had one key. The seam
  check found each by throwing, including the two that mattered: the ostinato
  was left behind in the old key, and **the check itself was asking the wrong
  key** — which would have condemned a section behaving perfectly and passed a
  note genuinely wrong in the section's own scale. Two hand-written lists of
  "the materials" (freeze pass, seam check) became questions to the song; the
  comment beside one already recorded it had forgotten `Bvar` once.
  **AND IT EXPOSED A SHIPPING DEFECT UNRELATED TO ANY OF IT.** The acid line's
  octave-down could reach an octave below its declared register: measured on the
  previous build, **acid wrote 420 notes below MIDI 24 on 21 of 300 seeds
  (lowest 21), minimal techno 108 on 5 seeds (lowest 19)** — the floor the drone
  has had for months was never put under the acid line. It is now, which **moves
  acid on 19 of 300 seeds**, a genre that asked for nothing. The notes it moves
  are notes nobody could hear (A0 → A1) and the 303's accent/slide follows
  because both read pitch. I first wrote in the code that no genre reached below
  the floor; that was wrong and is corrected there with the numbers. `docs/genre-research/key-shift.md`.

- **`08j`** THE DK GENRE BECAME `vgm`, AND CHRONO TRIGGER'S HARMONY ARRIVED.
  The user: *"research the music of Chrono Trigger, and Donkey Kong 64. We
  want to take in this data and update the DK genre change it to VGM."*
  DK64 was already researched — `dkc.md` covers Kirkhope beside Wise with
  numbers MEASURED off MIDI — so the new work is Chrono Trigger and the
  framing: `docs/genre-research/chrono-trigger.md`.
  **THE RENAME MOVES NO NOTE AND THAT IS PROVED, NOT HOPED**: no substream in
  the file is keyed on a genre name, so the key is a label the draws never
  see. Driven: the roll with the rename alone differs from the old `dkc` roll
  by **exactly one line — the header's label**; same key, tempo, rig, bars and
  event count, every note identical.
  **WHAT DOES MOVE THE MUSIC is one sourced line.** Mitsuda's identifying cue
  is harmonically unmoored on purpose — *"a melancholic minor key melody
  courtesy of the sitar in the Gb tonality"* [corpus:videogamemusicshrine],
  described elsewhere as F# minor against D major — and **the program could
  already write it and nobody drew it**: `plr()`'s L transform maps a major
  triad to the minor a major third up, which IS D major ↔ F# minor. So `vgm`
  declares `harmony: { style: "plr", chance: 0.22 }`. It belongs on THIS
  genre because `dkc.md`'s measured headline is that Wise's harmony is not
  functional either — two composers refusing functional harmony by two
  mechanisms, and this adds the second to a table built on the first.
  MEASURED: **62 of 300 songs move (20.7% against a declared 22%)**, and the
  re-baseline was checked line by line rather than overwritten — **62 of 2400
  baseline lines moved, every one of them this genre, ZERO other genres**.
  Read on the roll, seed 12: `G#m E B G#m` → `B G#m B Bm*`, a B major against
  a G# minor a major third away — the sourced relationship, in the output.
  RULE ONE: the other seven genres byte-identical.
  **NOT built, and said so in §7 of that sheet**: the sitar, the kenong and
  the kethuk (no such voices, and inventing them from a one-line description
  is the error `dkc.md`'s own header warns about); the SNES echo's sourced
  240 ms ceiling as a law (it would re-voice every song in the genre and wants
  its own measured commit); and the eight-voice SPC700 budget.

- **`08i`** THE PARAMETER LOCK, researched at last and then used. The user:
  *"More P locks. More research."* The mechanism has existed since the motion
  system landed and three documents called it rare for weeks with **no
  research sheet behind it at all** — so the sheet came first:
  `docs/genre-research/parameter-locks.md`, with Elektron's own definition
  verbatim from two manuals (*"a parameter lock is a parameter locked to a
  certain value for a specific step"*).
  CENSUS FIRST, off the compiled plan: **12 lanes, 1.5% of 806**, every one
  firing, none dead. So this was a live mechanism nobody leaned on.
  **JUNGLE was the strongest case and it is structural** — a chopped break is
  already a per-slice instrument (*"the 'Built-in' slicing preset creates a
  Drum Rack with chains holding a Simpler for each slice"* [corpus:soundonsound];
  KAN say the same naming pitch/envelope/filter). Our break machine ALREADY
  declared that whole trio and jungle locked only the PITCH, so three-quarters
  of the sourced mechanism sat unused. `amen.tone` and `amen.tail` added.
  **PLASTIKMAN** gets a hat lock, on its own genre's definition — minimal techno
  *"evolves through micro-variation … not through adding new parts"*
  [corpus:beatkey, already in the repo]. Appended, never inserted: a substream
  is keyed by control AND index, so inserting re-rolls every later lane.
  MEASURED, and the notes cannot see any of it (rolls byte-identical, snapshot
  IDENTICAL — correct, motion never touches an event), so the instrument is a
  render A/B with a same-build control: **jungle −45.5 dB against a −90.6 dB
  floor** (45 dB above it, unmistakable); **plastikman −74.4 dB in the hat's own
  band against −107.9 dB** (33 dB above the floor, and small — about 40 dB under
  that band, which is what micro-variation means); **lofi, untouched, 0.2 dB —
  inside the noise.** AND THE BROADBAND READING UNDERSTATED THE HAT BY 25 dB:
  measured across the whole spectrum it looked marginal at 8.3 dB over the
  floor. Anchor the window to the thing you are measuring — third time.
  bladerunner and dungeon synth keep ZERO p-locks deliberately, and dkc's one
  small lane is left alone because **no source was found for it**.

- **`08h`** THE DESK, on two user reports in one message. (1) **THE PART
  STRIPS' FX SENDS WERE PINNED AT FULL AND MOSTLY WIRED INTO A ZERO** — *"All
  the instrument [strips'] FX reverb and the other at the highest setting on
  all songs at all times, moving the knob does nothing at all."* Both halves
  exactly true, and the second is the worse one: MEASURED before touching
  anything, **56 of the 82 part/send knobs across the eight genres multiplied
  into a bus master of 0**, and the record surface's two were connected to
  nothing at all (its row into both effect columns is a pair of blind plates).
  It read 1.00 because the knob was a SHARE of a send master and a share opens
  at full. The sources say that resting position was wrong on its own terms —
  every console manual defines a channel send as *"off when turned fully
  down"* [Mackie 1642VLZ4 §35; Allen & Heath WZ3], and the failure mode is
  documented verbatim: *"Novice users often forget to turn up the aux send
  masters and consequently no signal is sent to the aux device"* [cmtext,
  Indiana University]. So the knob is the SEND ITSELF now: it opens at what
  this song sends that part's bus (0 where the genre sends nothing), and
  turning it UP opens the master exactly as far as that one part asks while
  every other part on the bus is held where it was by its own share. Untouched,
  every share is exactly 1 — the old wire, and an untouched lofi record renders
  at **−118.5 dB against a −118.6 dB same-build floor**. A strip draws no knob
  where the desk has no wire, derived from `MATRIX`. `channel-sends.md` §7.
  (2) **THE COMPRESSOR IS ON THE DESK** — *"the Master Mixer should have the
  compressor located under it or on it."* `panel.host: "mixer"`, the desk EQ's
  own key carried one machine further, drawn in the strip row immediately after
  the master fader. The source is emphatic and is SSL's own manual: its Section
  4 is titled *The Centre Section* and the Quad Compressor inside it *"uses the
  same VCAs that are used by the main output fader"* — on that desk the bus
  compressor **is** the master fader's gain stage. `bus-compressor.md` §7, which
  also surveys four other consoles and says honestly that this is an SSL/API
  idiom rather than a law. Two things were derived on the way: `mixMaster`
  stopped naming `INSTRUMENTS.desk` by hand, and `mk2_ui`'s picture check
  stopped querying `.machine[data-machine]` — a hosted machine wears no outer
  rack class, so that selector found nothing and the loop's `continue` would
  have **silently retired the only check that can see whether the VU draws**.
  RULE ONE: all eight rolls byte-identical, before and after, both halves.

- **`08g`** THE SPRING TANK — "a different kind of room from the one we have,
  not more of the same — the boingy one. Springs that shake, and a tank you
  can kick." A new matrix column and return row (after the room in the order,
  so echo→spring — the dub wiring — is open and the DAG holds; 7 backward
  paths auto-blinded with reasons). The IR is SYNTHESISED and seeded like the
  room's: an echo train at the tank's round-trip time, each bounce a rising
  chirp ("higher frequencies travel slower" [corpus:spinsemi]), each later one
  longer, duller, noisier ("progressively blurred" [corpus:valimaki]), −60 dB
  by DWELL. Its crossings are `voicing`+`live` — THE HAND'S, deliberately: no
  genre here is dub, so no genre rides them until one earns it by asking for it
  (docs/genre-research/spring-reverb.md §4 states this as the honest reading
  of the must-be-ridden rule, not an exemption). KICK THE TANK injects a real
  transient into the springs on the live graph — the documented dub move —
  and the panel's three coils read the PICKUP through an analyser: still /
  ringing / kicked, never the knobs. Unfed, the unit is render-transparent
  (A/B in the commit).

- **`08f`** Two user directions. (1) **THE BASS UNIT KEEPS ONE FACE** — "no
  matter the kit its always the tr" — and the two halves of that are one fix:
  the engine entries stopped overriding `krow`/`deck`/`jacks` (the chassis is
  the chassis; an engine brings only `own`, drawn in one stable row), and the
  box's five universal knobs (`sharedReads`: tune, accent, slideTime, muffler,
  volume) are now READ BY ALL FIVE ENGINES through `bassBox`/`bassGlide`/
  `mufflerStage` — because the old UI amputated the deck precisely so its dead
  knobs would not be lies. The 303-circuit-only knobs draw DIMMED over other
  engines with a tooltip naming whose circuit they are (the patch sockets'
  honesty). Measured: acid untouched (A/B −118.6 dB); the flags were real
  music (plastikman 1001 accented + 331 slid sub notes in 6 seeds, jungle 720
  slides) — audible where they play, reported as the feature it is.
  docs/genre-research/bass-unit-face.md. (2) **THE BUS COMPRESSOR** — an
  insert between the desk and the tape, 2:1 / slow attack / breathing release
  (all sourced, docs/genre-research/bus-compressor.md), three-way POWER, and
  A NEEDLE READING THE NODE'S OWN `reduction` so the picture cannot claim a
  squeeze that is not happening. Four dance-floor genres declare `comp: 1`;
  the score-like four stay untouched and a seam check pins exactly that split.

- **`08e`** The GENRE's legato, and the desk moved onto the master strip. Two
  user directions in one message. (1) `legato: { part: 1 }` is a genre table
  key now — bladerunner holds both of the player's lines (a slow-attack patch
  played detached never finishes opening [corpus:reverbmachine]), synthwave its
  tune ("mono legato mode is frequently used on synth ... leads"
  [corpus:attackmagazine]). It rides `space` to the graph like the tape does
  and is read at dispatch beside the hand's button, which became THREE-WAY:
  follow the genre / forced ON / forced OFF — the tape POWER's rule worn as one
  key. Notes unchanged, snapshot byte-identical; the A/B render is the
  instrument that sees it, AND ITS FIRST RUN MEASURED ITS OWN SETUP AGAIN,
  fifth time on this project: bladerunner seed 5 read INAUDIBLE because the
  declared parts play NOTHING inside the probe's compare window — the acid-zero
  lesson from `08d` §6, met the very next build. Counted before rerunning:
  seed 5's first held-able note is at 30.9 s; seed 1's is at 1.8 s. The real
  A/B numbers are in legato.md §7. (2) The desk's six EQ controls are drawn on
  the mixer's MASTER
  strip via `panel.host: "mixer"` — same keys, same kinds, same genre
  automation, same TRIM; only where they are drawn changed. `drawnElsewhere`
  derives it, the same rule as the pad bay's `pads`. What is NOT built, named
  in BACKLOG §5.1/§5.2: per-SECTION genre legato, and genre access to the
  per-part sends.

- **`08a`** The tape machine as an END-OF-LINE unit on the whole record, not a
  send — "the whole record goes through it or none of it does",
  `channel-sends.md` §6. A three-way POWER switch, wow, flutter and speed, with
  a deck you can watch. Four defects found by A/B before it shipped, all of the
  same family: a picture agreeing with a number the graph was not using.
- **`08b`…`08c`** The barberpole made into a barber pole and an 8-bit screen for
  the crusher, plus `panel.picture` and a check that a declared picture actually
  draws. And **thirteen controls that were dead to the hand**: `switchEl` redrew
  itself and never told the graph, so `live: true` now means "the graph reads
  this per song, re-apply when a hand moves it".
- **`08d`** **LEGATO** — a button per part on the mixer strip, holding each note
  until the next one on that part starts. `docs/genre-research/legato.md`.
  Three things about it are worth carrying forward:
  - **The switch is stage 6 and the fact is stage 5.** The note carries
    `holdSec` (how long this key COULD stay down: the distance to this part's
    next onset, capped at a bar); `dispatch` decides whether to use it. That is
    the one place both the live pump and the offline render hand a note to a
    voice, so the button is LIVE — the pump schedules 1.2 s ahead, so a press
    lands about a second later — and a bounce does exactly what the owner heard.
  - **EXTEND, NEVER SHORTEN**, because the measurement said so: the CHORDS
    already overlap on seven of the eight genres and only the parts carrying a
    LINE have gaps. A switch that set durations rather than raising them would
    have pulled the chords back and been heard as damage.
  - **It moved the snapshot without moving a note**, and that is not a bug in
    either. The snapshot hashes every field an event carries, on purpose. The
    honest response is in START-HERE: hash the same songs with the new field
    stripped, show that matches the old baseline, then rewrite the baseline.

### WHAT 2026-08-07 BUILT — `07a` … `07f`

- **`07a`** A genre may write `"any"` or a weighted table where it used to
  write a knob's number, and the value is drawn per song from the control's own
  declared range. The Erang pack was 55 samples with four reachable; 53 of 55
  now, measured over 40 songs. Pad_03_C's stored root corrected by hand — 645
  cents, agreed by two independent measurements.
- **`07b`…`07c`** The drums. The war drum's `kTune` is in SEMITONES and had
  been treated as a multiplier for two rounds. Its GAP — the share of a window
  more than 30 dB under its own peak — was **0%**: a decay of 1.6 s against
  strikes 909 ms apart, plus a 28% send into an 8.5-second hall, which no
  amount of clean decay survives. Then the opposite report, and A-weighting
  found why: **-13.6 dB RMS, -39.9 dB A-weighted**, the biggest thing in the
  record by power and inaudible. `g.tonic` was being handed a PITCH CLASS while
  the timpani voice read it as a MIDI note, so the kettles had been playing
  between 8 and 31 Hz. Both voices now carry a mid body and a contact
  transient.
- **`07d`** The mixer rack. A gain and three biquads per ROLE in front of its
  bus, a fader opening at the genre's own balance for that part, and a meter.
  Provably transparent untouched (-105.2 dB against a -104.9 dB renderer floor).
- **`07e`** The mixer's controls were dead — `window.Sound` is undefined for a
  `const`. The roll's floor was 0.875 px a sixteenth, which is the definition of
  a smear rather than the cure for one; it is 3 px a sixteenth now. And the
  drums got the eight-bar phrase.
- **`07f`** The phrase applies to EVERY genre. `kit.phraseBy` says which medium
  carries it — the hits, or a knob through the new `phrase` motion kind.
  Sources in `docs/genre-research/rhythm-phrasing.md` §8.

### THE ERROR THIS SESSION KEPT MAKING, NAMED

**Writing a list where I should have read what is there.** It happened five
times in one day and the user named it each time:

- a genre's patch numbers hand-picked, so four of 55 samples were reachable
- `openWith` a shortlist of three roles, so four parts could never open a song
- `outro: ["keys"]` — one video deciding how every record ends
- the drum phrase adding lanes from a fixed list, so genres wanting no toms got
  132 a song
- three genres EXEMPTED from the phrase on an argument the source contradicted

The cure is the same every time: **derive it from the declaration.** `vocab` is
the lanes bar zero plays. `"any"` is the control's own range. `openWith`
defaults to every role with an entry point. `kit.poly` is what the polymetre
check reads.

> **`node_modules` IS NOT IN THE REPO and four probes need it.** `mk2_ui`,
> `mk2_blend`, `mk2_midi` and `probe_voices` drive a real browser, and on a
> fresh clone they die with `Cannot find module 'playwright'` — which reads
> like a broken probe and is not one. `npm install playwright` (~3 s; the
> browser itself is already in the image at `PLAYWRIGHT_BROWSERS_PATH`, so do
> **not** run `playwright install`).

> **`mk2_ui.js` IS FLAKY.** About one run in five reports a single failure and
> every re-run is clean; seen twice on 2026-08-04 on unrelated commits and
> again on 2026-08-07. It is browser timing, not the program. **A red run must
> be re-run and BOTH results reported**, never just the green one. The summary
> now reprints the name of every failed check at the bottom, so the next one
> can be identified instead of scrolling away. `BACKLOG.md` §6.6.

**SIX BUILDS SHIPPED ON 2026-08-04 AND NOT ONE HAS BEEN HEARD.** `04b` the
Wurlitzer, `04c` the record surface and the kick duck, `04d` chord quality from
1170 jazz tunes, `04e` the bass leaving the root, `04f` the widened out-of-key
law, `04g` jungle's chords. Two genres changed; five are byte-identical
throughout. (`04h`, THE ROLL, is a display and moves no note — 2100 seeds
byte-identical — so it does not join that list. It does make the six visible.)

**AND `04i`/`04j` MAKE IT EIGHT, both on lofi and both audible.** `04i` gives
the tune an electric piano instead of the house sawtooth — the single loudest
change to this genre in weeks, and it moves no note. `04j` makes the tune stop
between phrases and brings the hook inside the sourced note count; 300 songs
moved, all of them lofi. **The playing brief in the backlog should be
started from `04j` rather than from `04b`** — every earlier build is inside it. And §0 of
the backlog — *nothing should be built on top of this stack until it has been
played* — applies to all six of them.

**THE HEADLINE THAT IS NOT A BATTERY:** almost none of the last two weeks of
work has been judged. `docs/BACKLOG.md` §0. Measurements prove a thing
exists; the sax proved they never prove it sounds good.

> **The container has rolled this clone back to an old commit three times in one
> session.** Twice mid-task. Nothing was lost because everything was pushed, but
> if `git log` shows a commit you do not recognise as HEAD, you have been rolled
> back — `git fetch origin claude/code-review-6jd9cz && git reset --hard
> origin/claude/code-review-6jd9cz` and check what you had uncommitted. **Commit
> and push early. Do not sit on work.**

---

## 0. The one rule that matters

**Honesty above all.** This project's history is a string of confident "fixed"
claims that turned out to be false, and that is the single most expensive thing
that has happened to it. If you have not measured it, say you have not measured
it. If a test passed, say which test. If something is a guess, mark it `[GUESS]`.
A green checkmark you did not earn costs more than a bug you reported.

Corollaries that have already bitten, twice each:

- **You cannot judge how anything sounds.** Audio renders prove nothing to you. The test that
  matters is `harness/mk2_roll.js` — the printed note grid — and the `.mid`.

  > ### ⚠ AND THAT TEST IS NEVER OPTIONAL
  >
  > **Stated by the user, 2026-08-04: reading the printed notes is ALWAYS a
  > test, on top of whatever else you ran.** Not instead of the battery, not
  > only when notes were expected to move, not only for the genre you were
  > working on. Every change, every time:
  >
  > ```sh
  > node harness/mk2_roll.js 1 --genre <genre>     # for ALL SEVEN
  > ```
  >
  > Print it before and print it after, and put the two side by side. If you
  > believe nothing moved, the printout is how you find out you were wrong; if
  > something did move, the printout is the only place you can see WHAT.
  >
  > **`--genre` is a named flag and the roll silently ignores a bare genre
  > name.** `mk2_roll.js 1 acid` composes LOFI and says so in its header, which
  > is exactly how a "all seven genres identical" claim got made on 2026-08-04
  > from seven runs of the same genre. The conclusion happened to be right and
  > the evidence was worthless. **Read the header line of every printout and
  > check it says the genre you asked for.**
  >
  > Passing a battery is not a substitute. The snapshot hashes every field an
  > event carries, so it goes red when a decorative field is added and nothing
  > musical moved; the seam checks prove laws hold, not that the music is good.
  > Neither of them shows you a chord turning from minor to dominant. The
  > printout does.
- **USE WHAT WE HAVE, AND FIND MORE — ALWAYS.** The user, 2026-08-02, on
  the sax material work: internet research on the topic AND on finding the
  scores, every time — existing corpora do not exhaust a question. The
  Weimar measurements were right and still missed what the Omnibook scores
  gave in an hour (phrase-final stability 90.9%, pickups 26.3%). One
  source is a claim; two agreeing is a target.
- **FULL RESEARCH FOR EVERY GENRE YOU TOUCH.** Stated by the user 2026-08-02:
  *"The internet is full of data that you have not seen and you have no a verdict on it —
  this data is the only way for you to improve the program."* Never write a
  genre table from what you already believe about a genre; what you already
  believe is training-data residue, not research. The order is fixed: research
  → write it down in `docs/genre-research/` with named sources → then the
  table. Grounding, strongest first: measured structure (the repo already
  holds `corpus/.harmonix/` section annotations of real records), primary
  sources (the artist saying what they did), named secondary analyses. When
  sources conflict, write both down and defend the choice — the Dilla kick is
  the model. A guess marked `[GUESS]` is honest; a guess dressed as research
  is the most expensive thing this project produces. The history proves the
  point in both directions: every genre mechanism that works (the sax
  phrasing, the Reese, avoidKick, the Amen construction) came from a source,
  and every research error (Plastikman's bass on the wrong lane, "IDM") came
  from imagining the mechanism between two true facts.
- **When a measurement says something surprising, the first suspect is the
  measurement.** `harness/probe_controls.js` took **twelve** setup corrections
  before its output could be trusted — nine before it found a single real bug
  and three more after. Every real defect it reported was real; every *other*
  "dead knob" it reported was the probe measuring its own setup. §3 lists all
  twelve, because they are the twelve ways a measurement here goes wrong.
- **The user's a verdict on it are the final judge.** Do not render songs for them unless
  asked; they have explicitly said it is a waste of effort. Ship the HTML, they
  will judge.
- **ALWAYS READ THE NOTES.** Reading the printed roll has found defects no
  spectrum analysis ever would: a counter line that was a parallel harmoniser, a
  bridge with an identical drum kit, metronome hats, a bass that ignored its
  genre, 1520 notes silently missing from the `.mid`.

### READING THE NOTES — what it actually means, because it is the whole method

Every single real defect found on 2026-07-31 was found by **reading the output
and comparing it to what the table claimed**, and every one of them was invisible
to a battery that was green at the time. This is not a slogan, it is the
procedure, and it has four steps:

1. **Ask what the table CLAIMS.** Comments in this file make claims. The
   Plastikman entry has said *"now all you've got is this polymeter"* since the
   day it was written.
2. **Measure whether the notes DO that.** Not "does it render", not "does a
   check pass" — reconstruct the property from the note array. Measured: 0.0% of
   that genre's drum lanes differed from one bar to the next. Every lane landed
   on the same sixteenth in every bar of the record, forever. **The engine could
   not produce a polymeter at all.** The quote was decoration and had been for
   the life of the file.
3. **When they disagree, the comment is not the bug — the silence is.** Nobody
   had lied; nobody had checked.
4. **Then write the check that would have caught it**, and make it compare the
   thing to *another thing*, not to a number. See below — this is the failure
   mode that let four separate defects sit green.

Found this way in one session, all with green batteries:

- **The polymeter that did not exist** (above).
- **The song peaked in the wrong place.** The arrangement flags a section
  `peak`; a separate energy arc rises and falls across the record. Nothing made
  them agree. Measured over 40 seeds × 7 genres: the arc peaked **before** the
  peak section in **256 of 280 songs**, 40/40 in lofi and Plastikman. The final
  chorus was the *quietest* statement of its own function — 14.8 gain/bar
  against 22.3 for an ordinary one.
- **Every genre had the same kick.** `V.kick` resolved through `panelValue`,
  which takes the global `PARAMS` as its base — so the kick played was whichever
  genre was loaded on screen. lofi, synthwave and DKC rendered **byte-identical**
  kicks (rms 0.07070, peak 0.5998, all three) while synthwave asks for tune 49 /
  decay 0.34 / gain 1.25 against lofi's 60 / 0.18 / 0.90.
- **Every "collision in Avar" this project has ever reported was one line.**
  `keysA` is built once and used in both A and Avar, but was only ever shown
  `ostA` — so the comp could voice a chord onto a pitch the *varied* ostinato was
  about to take. The tell was in the failure message the whole time: the material
  was **always `Avar`**, never A, B or C. Fixed at its owner; blends went
  501/504 → **504/504**.
- **Four drum lanes were falling out of the `.mid`.** `rim`, `clap`, `crash`,
  `ride` had no `GM_DRUM` entry, so every note on them was silently dropped —
  and the polymeter lives on the rim and the clap, so a Plastikman `.mid` was a
  kick and a hat with the identifying part deleted.
- **0% of lead notes were slurred**, because there was no articulation model at
  all: every note got the scoop, the breath and the full attack that belong to
  the *first* note of a phrase.

### A CHECK THAT COMPARES A THING TO A NUMBER CANNOT SEE THAT TWO THINGS ARE THE SAME THING

This is the single most valuable lesson of the session and it explains four of
the defects above.

The audio battery probes the kick **once per genre**, precisely so one genre's
drum cannot stand in for the palette. Three probes. All three passed. All three
rendered **the same audio**, because each was compared to *its own baseline
number* and never to *each other*.

Same shape, four times:

| the check | what it compared | what it could not see |
|---|---|---|
| `solo kick_lofi/synthwave/dkc: sits at its baseline` | each probe vs a number | three probes measuring one sound |
| `the .mid carries every note of every genre` | events vs a **hand-copied lane list** | four lanes missing from *both* the list and the exporter |
| `the kit is audible in its own band` | `MACHINE == "tr808"` | the machine was renamed `tr1000`; every 808 kit measured against the **acoustic** kit's floor |
| `minimal techno's polymeter is real` *(before it existed)* | nothing | there was no check |

**So: derive, don't copy, and compare things to each other.** The `.mid` check
now derives its lane list from `GM_DRUM` itself. The kit-band floor asks which
**kit is loaded** rather than matching a machine name. And there is a new check
that compares the per-genre kick probes to *one another* — 5.4 dB apart now.

### And check the simplest thing the program does

`mk2_ui.js` had 24 checks that drove knobs, step grids, pins and panels. **Not
one of them asserted that pressing play makes a sound.** The transport was
measured for its position readout and never for its output — so a change to the
audio start-up path took *all* the sound away on iOS and every check stayed
green. Two new checks measure the master bus after the button is pressed. If you
touch anything near `ensureLive`, `playLive` or `startPlayback`, those are what
cover you.

---

## 1. What this is

**One self-contained HTML file** — `Deckards Orchestrator MK2.html` — that
composes and plays complete generative songs. No server, no CDN, no build step,
no dependencies. That property is not a nicety; it is what makes the program
usable at all, and it is why **VSTs are impossible here** (a VST is a compiled
native binary that a host process loads; a browser cannot load one and there is
no host). What we *can* use is open-source **work**: permissively-licensed data
(the mda ePiano bank, MIT, is embedded) and published **analysis** of hardware
(Nuked-OPN2's envelope arithmetic, Stinchcombe's 303 measurements, the CS-80
filter teardown). GPL-3 code — JS80P, mda-lv2 — cannot be vendored without
relicensing the whole file. See `docs/LICENSING.md`.

The file is ~2.2 MB: roughly 3,400 readable lines plus one 1.07 MB base64 line
(the ePiano sample bank). Editors that try to soft-wrap that line will hang;
use `sed -n 'A,Bp'` / `Read` with offsets rather than opening it whole.

### Do not write Python patch scripts

Earlier sessions edited the HTML by writing throwaway Python scripts into a
scratchpad that did string substitutions. It works, but it is confusing to
anyone reading the session and it puts a layer between you and the file. **Edit
the HTML directly.** Nothing in `/tmp/.../scratchpad/*.py` is part of the
program and none of it is checked in.

---

## 2. The architecture, and the laws it is under

### THE FOUR PRINCIPLES — the user's own statement of the design (2026-08-02)

Everything below in this section is the machinery; these four are what the
machinery is FOR. When a decision is not covered by a written law, decide it
the way these four point.

1. **The rule of thumb is CONSTRAINTS, not baked-in values.** A stage or a
   genre declares a constraint and the program works inside it; a literal
   value wired into stage logic is a defect even when it sounds right. This is
   the shape of every good mechanism in the file: stage 2's laws zero weights
   rather than pick sections, the non-chord-tone law narrows the next draw
   rather than moving a written note, `avoidKick` empties steps rather than
   placing bass notes. And it is the shape of every worst bug: the compulsory
   chorus was the word "chorus" baked into four places where a constraint
   (`payoff`) belonged.

2. **There are SOFT laws and HARD laws.** A HARD law is definitional — break
   it and the thing is no longer itself. An intro can only ever be at the
   start of a song and an outro only at the end, in every genre (enforced by
   construction in `makeForm`: no transition table can reach either); a
   pre-chorus that never reaches a chorus is not a pre-chorus (H1–H4). Hard
   laws live in stage code, zero the weights, and hold for all genres. A SOFT
   law is a habit with weights — bridge after the second chorus, build→drop —
   and lives in the genre tables where a genre can lean on it or not. The
   research discipline in stage 2's comments is exactly the sorting of claims
   into these two bins, and refusing HARD status to a habit matters as much as
   granting it: a law nobody can break is worth having; a habit dressed as a
   law just removes seeds.

3. **Music theory is the PHYSICS ENGINE.** Scales, chord tones, resolution by
   step, the low-interval limit, register bands: these are the collision rules
   of the world, not style choices. Genres are free agents moving inside that
   physics the way objects move inside gravity — which is why the theory block
   is pure functions with no genre in them, and why a violation THROWS instead
   of warning: the program does not negotiate with physics.

4. **Music is NOVELTY, constrained — driven by arithmetic and randomness.**
   Neither alone is music: pure rule is a loop (LZ 0.00, the first bar
   forever) and pure dice is a shuffle (LZ 1.00, noise at the same density).
   Everything interesting in this program is arithmetic working against a
   seeded stream inside a constraint — the person playing it that counts with zero
   draws, the polymeter whose phase is drawn once, `probe_novelty`'s two
   controls written down before the mechanism existed so the null could not be
   chosen to flatter it. The constraint is the generator.

Six stages. Each one `Object.freeze`s its output. **There are no correcting
passes** — MK1 had a "ghost pass" that fixed up violations after the fact, and
removing that idea is the central reason MK2 exists.

| # | Stage | Owns |
|---|-------|------|
| 1 | CHART | seed, genre, rig, **picks**, root, mode, tempo, keysChar, tape |
| 2 | FORM | the section sequence and its demands |
| 3 | MATERIALS | **every pitch.** Pitch is final at the end of stage 3 |
| 4 | ARRANGEMENT | which material each section plays, and how stripped |
| 5 | PERFORMANCE | **timing and gain**, each written by exactly ONE formula |
| 6 | SOUND | who is holding the instrument, and what the room is |

**The laws:**

1. **One owner per property.** If two places can write it, it has no owner. The
   voice field is written in exactly one place (stage 5, through
   `voiceFor()`). Gain is one expression. Timing is one expression.
2. **Law 4 — a genre is parameter tables only.** No code in stages 2–5 may
   contain a genre name or branch on one. If you find yourself writing
   `if (genre === "jungle")`, the thing you want belongs in the `GENRE` table.
3. **Determinism.** No `Math.random`, ever. Randomness comes from
   `stream(seed, "name")` named substreams, and **draws execute
   unconditionally** — a draw inside an `if` starves every later draw on that
   stream and silently moves songs you did not touch.
4. **Seam checks THROW.** `composeSong` proves its own output at the end. A
   violation is a crash, not a warning.
5. **Provenance.** Every constant carries a mark: `[corpus:<source>]`,
   `[theory]`, `[CHOSEN]`, `[GUESS]`. A bare magic number is a bug. A provenance
   that does not match its constant is *worse* than none, because it stops
   anyone checking — that exact defect was found and fixed in the headroom
   comment.
6. **A rig changes WHO plays, never WHAT is played.** `composeSong(1,"band")`
   and `composeSong(1,"sega")` are the same performance by two bands.
7. **Every knob declares its kind, and the kind says who may touch it.** See
   below — this is what decides which controls the program rides.

### The conductor's contract — which knobs the program may move

The question "how should the program decide what to do?" needs a stated rule,
not per-genre improvisation. Every control in `INSTRUMENTS` carries a `kind`:

**The four timescales `motion` can express**, and a genre should think in all of
them:

| kind | timescale | what it is for |
|------|-----------|----------------|
| `plock` | within a bar | per-step detail — the acid p-lock |
| `lfo` | bars, free-phase or bar-locked | weather; nobody should be able to point at it |
| `section` | section to section | *categorical* — chorus is always +X |
| `gesture` | 1–2 bars into a fill or a peak | the hand on the dial over an arrival |
| `arc` | **the whole record** | where the song ENDS UP vs where it started |

`arc` was added last and it closed a real hole. Measured across 81 automated
controls *before* it existed: 3.7% of dial within a bar, 6.5% bar to bar, 12.0%
section to section — and 6.8% start-to-end, which was **incidental**, whatever
the free-running LFO phases and the section order happened to leave behind.
Nothing expressed "the record goes somewhere", because a `section` move is
categorical: the third chorus is identical to the first, and a nine-minute acid
record built that way arrives where it started. Wikipedia's definition of acid
house is literally an arc — the sound is made *"by raising the filter resonance
and lowering the cutoff frequency"* over the record — and Hawtin's Consumed is
*"a year of subtraction"* across an album side. With arcs in, acid's
`tb303.cutoff` travels **43% of its dial** from the top of the record to the
end, and dkc's `rhodes.tone` 25%.

| kind | meaning | may the conductor move it? |
|------|---------|----------------------------|
| `switch` | a discrete choice — the 303's waveform, the Mellotron's tape set | **no** — mid-song it is a different instrument, not a gesture |
| `voicing` | what the instrument *is* — kick body and level, tremolo rate, the CS-80's initial bend | **no** — automating it makes the instrument wander instead of the performance moving |
| `bus` | a gain **node** the whole kit passes through — drum drive, gate send | **yes, as a curve** — `rideBus()` writes an automation curve on the node across the song. Not per note. |
| `gesture` | what a player's hand is on — cutoff, resonance, brightness, decay, ensemble | **yes, per note** — through `P()`. This is what `motion` is for. |

Four seam checks enforce it, and together they close the loop:

- **every automated knob reaches the sound, at the note or on the bus**
- **every knob on every panel reaches the sound** — no control may be declared
  that no voice reads. (Four were, for as long as the rack existed: `subbass.cut`,
  `subbass.drive`, `chipbass.bright`, `chipkeys.bright`. They were drawn, they
  moved, and nothing happened.)
- **every knob the conductor can move is one some genre moves** — a gesture or a
  bus nobody rides is a knob the conductor is not using. Ten gestures and then
  twelve bus/kick controls were idle before this landed.
- **no switch or voicing control is automated** — the reverse error.
- **a genre's params name controls that exist** — no phantom parameters.
- **every value a genre declares actually reaches the panel.**
- **no genre inherits the previous genre's panel.**

**The last two exist because of the worst bug this rack has had, and it shipped
green.** `applyRack` walked the three *slots* and skipped any set to `"auto"` —
and `"auto"` means "whatever the rig names", which is most machines. So every
value a genre declared for a machine it reaches through the rig was thrown away:
**69 of them**, including `bladerunner.params.cs80.initBend`, the initial pitch
bend that is the single identifying feature of that score. It read 0. The scoop
had never once happened, while the table, the commit message and the comment all
said it was the line that named the genre.

Fixing that half exposed the other: `PARAMS` is one global table, so a machine a
genre says *nothing* about keeps whatever the last genre left on it. Composing
Vangelis then synthwave left the CS-80 holding a 1.0 initial bend on every note
of a genre that never asks for one — **382 controls** carrying another genre's
settings. `applyRack` now loads every machine every time: the genre's value where
the table has an opinion, the machine's own default where it does not. The user's
hand is untouched either way, because a drag writes `TRIM` (an offset), not
`PARAMS`.

Nothing threw. Nothing failed. The panel showed a plausible number the whole
time. **If you change how parameters reach a voice, write the check first.**

The upshot, measured: **57 controls — 38 gesture, 10 voicing, 6 bus, 3 switch.
All wired; 46 set by at least one genre; 44 ridden by at least one.** The 13
never ridden are exactly the switches and voicings — by contract, not neglect.

**The bus gains were the last thing to move,** and they were the hardest,
because an AudioParam has no note to be read at. `rideBus()` samples the motion
plan one point per beat and writes `setValueAtTime` + a `linearRampToValueAtTime`
chain onto the node. Measured with byte-identical drum events rendered at
different song positions — so the only variable is where the plan is read —
lofi's kit is **+1.16 dB** in the chorus and synthwave's spans **5.7 dB** between
bridge and chorus. Peaks move by 0.1 dB across that span: riding the bus pushes
the kit further into the drum saturator, so it thickens rather than just getting
louder, which is what riding a bus into a driven desk actually does.

Two related fixes came with it: the acoustic kick now reads its own panel per
note (it used to read a snapshot `setSpace` took before anything was scheduled,
so all four of its voicing controls were frozen for the whole song), and
`kit.body` / `kit.gain` moved onto that panel instead of living only in the
genre's `kick` block where nothing could touch them. The gate's **hold** turned
out not to be a bus control at all — every hit reopens the gate and decides for
itself when the door slams, which is a gesture — so `openGate` takes the event
now and looks the hold up on whichever drum panel the plan names.

When you add a machine, give every control a `kind`. If it's a `gesture` or a
`bus`, some genre that hosts the machine has to ride it or the battery fails —
which is the point: it stops a panel growing knobs nobody uses.

**How much of the movement is arrangement-driven?** 92 motion terms across the
six genres: **59% section- or fill/peak-driven** (the arrangement tells the knobs
where the song is), 32% free-running LFOs, 10% per-step p-locks. The reverse
direction — knobs changing notes — is forbidden by the stage boundary and must
stay forbidden.

### The blend — elements of any genre in any other

`composeSong`'s genre argument takes a **name or a map of names to weights**.
Stage 1 resolves either to ONE table and freezes it onto `chart.table`, which is
what every stage below reads. That is what keeps Law 4 true under blending: no
stage learns a genre name, it reads a table, and whether that table was written
by hand or blended from seven is stage 1's business alone.

**The rule: average what is continuous, draw what is structural.** Three
operations cover the whole table:

| op | applies to | why |
|----|-----------|-----|
| `mix` | numbers, same-shape numeric arrays | tempo, gains, wet, densities, accent maps |
| `merge` | weighted tables `[[v,w],…]` | half lofi + half acid means the mode draw is lofi's weights at half plus acid's at half — the most natural blend in the file |
| `draw` | everything else | one genre owns the field, weighted |

**Drawing is not a compromise.** The identifying features are *switches*, and
half a switch is nothing. Vangelis IS `initBend: 1.0`; Plastikman IS
`flourishBar: -1`; jungle IS `chop`. Averaging `flourishBar` between −1 and 3
gives 1, which is neither genre and is musically nothing. Drawn instead, a 70/30
song makes a **definite choice on every element** — so any single song is
coherent, and you hear the blend across the parts and across seeds rather than
as a smear inside every part. A chopped break under a Rhodes, not a half-chopped
half-Rhodes.

**Two failure modes, both found by measurement on a naive blender first:**

1. **Integer domains.** `counter.intervals` are *scale steps*. Averaged, lofi and
   acid gave **−4.5**, `degMidi` indexed `MODES[mode][3.5]`, got `undefined`, and
   the pitch was NaN. Same class: `swingUnit 1.5`, `flourishBar 2.5`, every step
   position and bar length — and `tempo`, which only rounded its *offset* and
   announced a blend at `82.80000000000001 bpm`. Those fields are in `BLEND_DRAW`.
2. **Internal consistency.** Fields that only mean something together must be
   drawn from the same genre — `BLEND_GROUP`. The ostinato cell and the register
   set were drawn independently, so a song could get DKC's cell with lofi's
   registers, which have no `ostinato` band: **172 of 1890 blended songs threw**
   until they were grouped.

**Measured now: 1889/1890 pairs compose at 25/50/75, and all seven blended at
once composes 30/30.** The one failure is a genuine register collision, caught by
the seam check — a blend *can* fail, roughly one song in six hundred, and the UI
says which seed and why rather than silently reseeding.

The sliders are a **constrained simplex with locks**: move one to *v* and the
unlocked others give way in proportion to what they already had; if the locked
total is *L*, an unlocked slider clamps at *1 − L* rather than silently refusing;
if every other unlocked genre is at zero, the remainder is shared equally (without
that, dropping the only genre leaves weight nowhere to go and the sum breaks).
`harness/mk2_blend.js` drives all of that through the real DOM handlers — none of
it is visible from the note grid, because it happens before a note exists.

### Determinism has a hard limit you must know

**Chrome's `OfflineAudioContext` is NOT bit-reproducible.** Measured: 1–3 LSB of
difference on up to 21% of samples between two renders of identical input. So a
WAV hash can never be the determinism test. The determinism test is the
**event list** — see `mk2_snapshot.js`.

---

## 3. The test harness — what to run, and what each one proves

> ### ⚠ THIS IS A CATALOGUE, NOT A CHECKLIST. DO NOT RUN IT ON PICKUP.
>
> **The line that used to be here said "run all of these before you claim
> anything" and it is deleted.** It contradicted the corrected testing rule at
> the top of this file, it sat here for a week after that correction was
> written, and on 2026-08-07 it cost a session two runs of the seam battery
> before a single character of the program had been touched — the second of
> which the container killed for memory.
>
> **A battery is a DIFFERENCE instrument.** It compares the program against a
> recorded baseline. If you have not changed anything, the comparison has no
> content: the number is already written in this file and the stamp already
> proves your file is the one it was taken on. Running it tells you nothing
> you did not have.
>
> So: **nothing below runs until you have made a change to run it against.**
> Which one you then run is decided by what you touched — see the corrected
> testing rule at the top of this file. On pickup you read, you orient, and
> you start work.

```bash
node harness/mk2_test.js                              # the seam checks
node harness/mk2_test.js kit                          # ...only the ones named "kit"
node harness/mk2_roll.js 1                            # THE test that matters
node harness/mk2_roll.js 1 --song                     # full arrangement
node harness/mk2_roll.js 1 --genre plastikman         # any genre MK2.genres() names
node harness/mk2_roll.js 1 --picks lead=sax           # load a machine and read what it plays
node harness/mk2_roll.js 1 --mid out.mid              # .mid round-trip check
node harness/mk2_roll.js 1 --blend lofi:50,jungle:50  # read a blended song
node harness/mk2_snapshot.js check harness/mk2_baseline.snap
node harness/mk2_ui.js                                # 33 checks, in a browser (FLAKY ~1 in 5)
node harness/mk2_blend.js                             # 10 checks, the blend sliders
node harness/mk2_midi.js                              # 20 checks, MIDI port, stub device
node harness/mk2_stamp.js check                       # is the published build this build?
node harness/probe_voices.js                          # fire every voice
node harness/probe_theory.js                          # the music laws, off the notes
node harness/probe_controls.js [machine]              # every knob reaches the sound

# ── the four that read the OUTPUT and ask whether it is what was claimed ──
node harness/probe_novelty.js                         # loop? noise? or generated?
node harness/probe_poly.js                            # each lane's real period
node harness/probe_sax.js                             # what the horn actually articulates
node harness/probe_pull.js                            # does the genre outweigh the seed?

node harness/probe_arrival.js 20                      # how a dissonance is REACHED
node harness/probe_comp.js                            # how the comp is voiced
node harness/probe_density.js 30                      # HOW MANY notes sound, and when nothing does
node harness/probe_harmony_neo.js                     # chromaticism and voice leading
node harness/probe_cymbals.js                         # the harsh band, absolute and as a share
python3 harness/make_sample.py <file> --name x --pitched   # WAV/AIFF -> embeddable payload

# ── the grid, the renderer, and who reaches what ──
node harness/probe_matrix.js synthwave                # every crossing moves air. ~20 min A GENRE
node harness/probe_render_determinism.js              # same events x3 null out
node harness/probe_wiring.js                          # which genre uses what was added
node harness/probe_kaoss.js                           # the pad reaches live sound

# ── the rendered-audio battery: half one makes the audio, half two asserts on it ──
node harness/render_audio.js /tmp/aud 1,2             # ~55 s, 52 renders
python3 harness/test_audio.py /tmp/aud                # assertions on the SAMPLES
```

**There is no "five-minute battery before any claim" any more, and the line
that said so is deleted.** It named six tools including four browser probes,
which is the whole chain, which is the thing the corrected rule forbids. What
replaces it: run `mk2_roll` and `mk2_test` **against a change you made**, and
run the browser probes **once, before publishing**. A claim is earned by
measuring the thing you changed, not by re-printing six numbers that were
already true.

**Run the rendered-audio battery too when you touch the SOUND** — the graph, a
voice, a genre's `space` or `kick`, the master chain. It is the only thing in
the repo that asserts on actual samples.

**It is at 316 passed, 15 failed at `af17de6`, and the way to read that is in
`docs/BACKLOG.md` §1.** Thirteen of the fifteen are ONE check whose ceiling was
calibrated before the program had a stereo stage. The history here matters:
this battery once sat at 346/8 with the eight reported as "pre-existing" and
skipped over, and **two of them turned out to be real defects in the music.**
So the rule is not "13 are known, ignore them" — the rule is that a red check
gets diagnosed, its diagnosis gets written down with its numbers, and the
diagnosis gets checked against the commit before. That is what was done here:
rendered from `7224caf` in a separate worktree, the same 15 appeared to the
last digit. **If it is red, it is red about this program until you have shown
otherwise.**

### `numpy` is needed for the audio battery

`python3 harness/test_audio.py` imports numpy. If it is missing:
`pip install numpy --quiet`. It is not in any manifest because there is no build
step; that is the trade for the file being self-contained.

### The build the user hears is not automatically the build you measured

**This cost three commits of work going unjudged.** The published artifact was
byte-for-byte commit `0f3a0a9` while the repo was six commits on: no kitFilter in
the circuit, five drum voices not reading their channel tune/decay, the gate send
never reaching the hand, no non-chord-tone law. Every measurement in §5 was taken
on a program the user had never played.

It was invisible because **both files carried the stamp `build 2026-07-29r`** —
the one instrument built to tell a stale page from a broken program, standing
still through a day's work. A stamp that does not move is worse than no stamp,
for the same reason a wrong provenance is worse than none: it stops anyone
checking.

So the stamp is a **seam** now, not a habit — `harness/mk2_stamp.js`, recorded in
`harness/mk2_build.json`, run inside `mk2_test.js`. It fails on any program
change until you bump the stamp in the HTML and re-record, exactly the way a
moved snapshot fails: **not an error, a step not yet done.** Its three branches
were each driven to failure before it was believed.

It does not inspect the live artifact — it records what was published and hashes
what you have. It catches the *cause* and hands you evidence for the *symptom*.

> **BUT THE LIVE PAGE CAN BE READ, AND FROM `2026-08-05e` IT IS.** `WebFetch` on
> the artifact URL returns the whole published document. Two things fall out of
> that, and both were done before republishing at 05e:
>
> - **Check what is up there before overwriting it.** The fetched page was
>   diffed against the previous commit's HTML and was byte-identical apart from
>   the hosting frame's own closing tags — so there was no hand edit in the page
>   to destroy. That is the check the 2026-07-29 artifact incident says to make
>   BEFORE republishing, and it can now actually be made.
> - **Check the stamp afterwards, on the page itself.** `mk2_stamp.js check`
>   compares the build to a RECORD of what was published; fetching the page and
>   reading `#buildStamp` out of it closes the loop the stamp alone cannot.
>   Do both. The record agreeing with the build is not the same claim as the
>   page agreeing with either.

**So: bump the stamp in the commit that changes the program, re-record, and
republish.** Same discipline as the baseline, and for the same reason.

- **`mk2_test.js`** — 110 assertions over composition seams: per-genre loops,
  "the counter is a line not a harmoniser", "the bridge is a departure", "the
  bass styles differ", "the .mid carries every note", plus the rack, the motion
  and the pins. Currently **93 passed, 0 failed**.

  Two of these were rewritten when the new genres arrived, and the reason
  generalises: *"the drummer actually uses the toms"* and *"every genre's second
  voice actually sounds"* both applied a **flat threshold** — synthwave's
  drummer and synthwave's octave double — to every genre. They failed the moment
  a genre arrived with no drum kit at all. A flat threshold cannot tell "the
  genre wants little" from "the code delivers nothing", so both now read the
  genre's own declared `kit.toms.use` / `counter.density` and hold the program
  to it **in both directions** — which is what stops a genre buying a pass by
  declaring nothing. If you add a genre and a test fails, ask which of the two
  it is before you touch the table.

  The newest is **"a non-chord tone that is still sounding resolves by step"**,
  guarded at 20%. It is a **threshold, not a zero** — an escape tone and a free
  appoggiatura are real writing, and a line with no dissonance left in it is a
  line with nothing in it. §5.6 has the whole story.
- **`mk2_snapshot.js`** — SHA over every event of every seed. This is how you
  prove a refactor is a refactor. It now defaults to however many seeds the
  baseline file holds, so the bare command is correct (it used to default to 200
  against a 300-seed baseline and report a false CHANGED). Current state:
  `IDENTICAL — 2100 seeds, not one note moved` (one line per seed AND genre; it
  used to compose only lofi on every seed and say "300 seeds"). It hashes the
  events, the form and the arrangement **separately**, which is how you tell a
  melodic change from a structural one: the non-chord-tone work moved the events
  hash on 1486 of 2100 lines and left form and arrangement untouched, which is
  exactly the claim that work was making.

  **If you change the music on purpose, rewrite the baseline in the same commit**
  (`node harness/mk2_snapshot.js write harness/mk2_baseline.snap`) and say so in
  the message. A stale baseline everyone has learned to ignore protects nothing.
- **`mk2_roll.js`** — prints the material as an ASCII grid plus note tables, a
  DERIVATION section, THE POCKET in milliseconds, **accent and slide on the bass**
  (`>` accent, `/n` `\n` slide) with a "303 view" block per material, and
  **PINNED markers** under any lane-bar the user has programmed. Takes
  `--pins <file.json>`. **Read this before and after every composition change.**
- **`mk2_ui.js`** *(new)* — loads the shipped file in Chromium, clicks the step
  buttons, drags the knobs, presses play, reads back what happened. Every other
  harness eval's the `<script>` out of the HTML and never builds a DOM, so
  nothing about the front panels was provable before this existed. ~10 s.

  Its last two checks are not about the UI at all: **every voice renders without
  throwing**, and **none comes out silent**. They live here because this is the
  only suite with a browser, and the hole they close cost real money. `dacHit` —
  the SEGA rig's kick and snare — spent several commits reading `ev.lane` off an
  `ev` it had never been passed, left behind when per-drum chains made the output
  destination depend on the lane. Every DAC hit was a `ReferenceError`, which in
  WebAudio does not degrade: it takes the rest of the render with it, so the DKC
  genre was simply broken. **88 seam checks, 21 UI checks, 10 blend checks and a
  2100-line snapshot were all green the entire time**, because not one of them
  ever CONSTRUCTS A SOUND. The seam checks read tables; the snapshot hashes
  notes; this file reads the DOM. Nothing stood between "the voice exists in `V`"
  and "the voice makes a noise". If you add a voice, this is what covers you.
- **`probe_voices.js`** — the same sweep with the full report: every voice, its
  lane, and its peak. Run it when a voice or a routing change lands.

### The four output probes — READ THE NOTES, with numbers

These exist because "read the roll" is right and does not scale to a claim like
*"this generates novelty"*. Each one reconstructs a property **from the note
array** and prints it per genre, so a table's claim can be checked against what
the notes do.

- **`probe_novelty.js`** — *is the pattern a loop, noise, or generated?* A drum
  lane over a four-bar material is a 64-step binary string, and three very
  different things can produce one. It scores each lane by **LZ76 complexity**
  against two controls built at that lane's **own density**: its first bar
  looped (**0.00**) and a seeded shuffle (**1.00**).

  **The shuffle control is the point.** "Deterministic rules watching the
  pattern" and "random notes" are trivially confusable by taste, so any
  rule-based claim that cannot be separated from a dice roll has not earned its
  place. The null hypothesis was written down *before* the mechanism existed so
  it could not be chosen to flatter it.

  Two findings from the baseline alone, worth knowing:
  - **Polymetre is phase, not information.** A period-5 pulse compresses
    *better* than a bar-locked loop (LZ 4 vs 6), so moving a simple pulse out of
    phase with the bar scores **negative**. Plastikman read −0.080.
  - **The break chopper is nearly a shuffle.** Jungle reads **0.914**. Not
    necessarily wrong — it is sampling a real break — but it is the other
    failure mode and it is already in the file.

- **`probe_poly.js`** — reconstructs each drum lane's **real period**: the
  smallest `p` that explains every onset across the whole 64-step material. A
  lane lines up with the bar when its period divides 16 *or* is a multiple of it;
  it is polymetric only when it is **neither**. The first version of that
  predicate was `16 % p !== 0` and it failed the control genre on an `openhat`
  at period 32 — a two-bar pattern, which lines up perfectly well.

- **`probe_sax.js`** — what the horn actually articulates: the share of lead
  notes that start a phrase, are slurred, are tongued, are detached, carry
  vibrato, and glide from a named predecessor. It also asserts that every glide
  belongs to a slur and every slur is stepwise.

- **`probe_pull.js`** — does the genre outweigh the seed, per musical feature.

### The seam checks added on 2026-07-31, and what each one is guarding

Twelve of the 110 are new. They are listed here because each one exists because
something was wrong, and the reason is the useful part:

| check | guards against |
|---|---|
| the horn slurs, tongues and detaches instead of striking every note | the articulation pass being dropped — it goes to 0% slurred |
| a rack set to none plays nothing, and moves nothing else | "none" recomposing the record instead of muting it |
| every box the picker offers into a rack actually plays there | a dropdown that moves and changes nothing (57/57 pairs) |
| minimal techno's polymeter is real, not a comment | the polymeter becoming decoration again |
| the person playing it fires, and what it writes is played | a rule writing into a lane the arrangement never plays |
| …and what it writes is neither a loop nor a shuffle | the mechanism degenerating to either end |
| …and no player writes more than its own arithmetic allows | runaway; the bound is `|watch| / every` |
| …and it does not write the same figure into every song | a deterministic rule watching only seed-fixed inputs |
| …and it can answer with a roll, not only a hit | the roll vocabulary going missing |
| …and the kit as heard still has the one | the downbeat being lost (union syncopation must stay 0) |
| a genre that declares no player gets none | the pass leaking into genres that never asked |
| pressing play actually makes sound *(UI)* | the audio start-up path silently breaking |
- **`probe_theory.js`** — the music laws read off the notes, per genre, over N
  seeds: out of key, non-chord tones unresolved, non-chord tones that end a
  phrase, chords under the bass, lead under the chords, unisons. Reports
  **rates, never a pass/fail on one song**. Some of them SHOULD be non-zero and
  the header says which.
- **`probe_controls.js`** — the sweep that proves every control on every machine
  changes the audio. Puts the machine in its slot, strikes every lane it owns
  with four kinds of note, renders with the genre's real space, kick, drive,
  gate and motion plan, and compares peak, level, brightness and tail with each
  control at the bottom and then the top of its travel, over three time windows
  per lane. **Slow** — the TR-1000 is ~40 minutes — so name one machine unless
  you have the wall clock. Whole rack at `4728512`: **0 silent controls on every
  machine except `tr1000.kit`**, a switch between four voice sets that a
  fixed-voice test cannot see by construction.

### The twelve ways probe_controls lied to me

Read this before writing any probe in this repo. Every one of these produced a
confident, wrong, red line, and the pattern is always the same: **the probe was
measuring its own setup rather than the program.**

1. It never PICKed the machine under test, so it read whatever the genre drew.
2. It set `MK2.PICK` but never handed it to `composeSong` — the picks are an
   **argument**, not a global the composer reads.
3. It rendered only the first lane, then called the snare and hat controls dead
   because the note was a kick.
4. It skipped the TR-1000 entirely, because that machine declares `kits` where
   the others declare `lanes` — the only drum machine anybody plays.
5. It struck one short unaccented note, which cannot see an accent knob.
6. It set `PARAMS` where `bus` and `gate` read `TRIM`.
7. It gave keys notes no `wow` field, and the Rhodes scales wow **by** the
   chart's drawn depth, so the knob multiplied zero.
8. It averaged over the whole 55-second, twelve-lane file. Moving the rimshot's
   filter end to end is under 0.1 dB of *global* level. → one window per lane.
9. It averaged over 4.2 seconds when `softAtk` is a **30-millisecond**
   difference. → a 60 ms window at each onset as well.
10. It measured controls that live inside another control's condition
    (`subbass.fall` needs `env`, `tb303.subLevel` needs `subOsc`,
    `tb303.sweepSpeed` needs a run of accents). → one retry with the whole
    machine wide open, reported as `only with the machine open`.
11. It wrote no `slide` on any note, and no note long enough to reach the end of
    a Mellotron tape. → four kinds of note per lane.
12. It gave the CS-80 no `ev.press`, so all three aftertouch knobs multiplied
    nothing — the same mistake as (7), three commits later.

And one worse than all of them: making the short note **accented**, which looks
like a more thorough test, hid `tb303.decay` completely — an accented 303 note
takes `accDecay` and never reads `decay` at all. **A more thorough test can be a
blinder one.** The only reason it was caught is that `decay` had been alive in
the run before.

The audio harness (`render_audio.js` / `test_audio.py`, 515 output assertions)
exists and works, and now renders WITH the motion plan at each excerpt's own
song position. The user does not want songs rendered for them. Use it to
measure, not to deliver.

---

## 4. What has been done

### 2026-08-02 — the form work begins: phases, H5, and the guard

The user set the frame first — the four principles at the top of §2 and the
research rule in §0 are theirs, written in before any code moved. Then:

- **`harness/probe_form.js`** — prints every genre's section sequences as
  words, plus after-peak wander and cross-genre twins. Its header carries the
  2026-08-02 baselines: 24-25/25 DISTINCT shapes per genre (ordering was 100%
  dice — the walk is a Markov chain and cannot express position), 13/175 songs
  wandering after their own peak (mean 63 bars, worst 160), and acid<->jungle
  sharing NINE whole-song shapes because jungle's form table is a near copy of
  acid's. Jungle's real architecture has never been researched (§5.4).
- **`form.plan`** — a genre may declare an ordered spine of phases (pool,
  bars budget, endOn); the grammar walk runs inside each phase under the same
  laws, now in one `lawTable` owner for both walks. Landed with the snapshot
  IDENTICAL over 2100 seeds — the mechanism provably changed nothing. **NO
  SHIPPED GENRE DECLARES A PLAN YET**; the battery draws it through a
  synthetic genre (five seam checks). Plans are written only after the
  genre's form research lands in `docs/genre-research/`, per the rule in §0.
- **H5 — a record past its length seeks its payoff.** The walk's break had
  claimed "a song ends off its payoff" forever; nothing enforced it. Stated
  by the user as the law it is: sections inform one another — Y plays when it
  is correct, only after X. Zeroes weights, never picks. And the 10-section
  guard was a baked value ending records mid-sentence (synthwave seed 2 ended
  prechorus -> outro); raised to a true backstop at 24. Together: wander
  13/175 -> **0/175**, and **605/2100 songs moved — most were being cut short
  of their genre's own declared length** (acid 120, jungle 116, dkc 107,
  lofi 34). 280/280 now end on their payoff. Re-baselined deliberately:
  `bf85a47a59a6fb4e`. Battery after: 115/26/10/20/355, 0 silent.
- **Known and left open on purpose:** `makeForm`'s `bars = coldOpen ? 0 : 4`
  counts every intro as 4 bars against the target, while six genres declare
  8- or 16-bar intros — a baked value undercounting the length arithmetic.
  Fixing it moves songs, so it goes in its own measured commit, not as a
  rider on this one.

**The user's directive, 2026-08-02, binding:** EVERY genre gets the full
research treatment — internet sources, named, written to
`docs/genre-research/<genre>-form.md` BEFORE its plan lands. Order: lofi
first (user's call), then the remaining six; jungle needs it most (it wears
acid's floor plan), plastikman has the strongest primary sources waiting.

**Lofi's plan landed at `2026-08-02c`** — `docs/genre-research/lofi-form.md`
has the sources. The shape the research gave: establish the loop → the
two-part alternation ("the same loop in different dress" — richardpryn) →
a sometimes-breakdown and the return, ending on the fullest statement.
MEASURED after: 19/25 distinct shapes (a family with repeats, was 24/25
pure dice), 6-9 sections, 44-64 bars ≈ 1:55-3:27 across the tempo band
(the long edge of the sources, [CHOSEN], the user's a verdict on it decide), 297/300
lofi seeds moved and NOT ONE seed of any other genre — the draw discipline
held. probe_form's twin metric now keys on word AND length, which
dissolved lofi's coincidental twins and kept the real defect: acid<->jungle
still share 9 identical records because jungle's form table is acid's.
The audio battery reads 331/52 (was 355/54): it derives its excerpts from
the songs, and lofi's songs changed. The "planless genre untouched" seam
check now names dkc — lofi stopped being the planless control the moment
its plan landed.

**Synthwave's plan landed at `2026-08-02d`** — Perturbator-forward per the
user; `docs/genre-research/synthwave-form.md`. The EDM/build form: two
builds each exiting on a prechorus ramp, two hooks, the drums-drop strip in
the middle, a climax ending on the chorus ("The drums drop out... The track
explodes into life once again" — absynth.space on Lustful Sacraments).
MEASURED: 96-136 bars ≈ 2:54-5:44 across 92-132 bpm, between The Midnight's
pop pole and Perturbator's 5:14 mean; 300/300 synthwave seeds moved, no
other genre. Reading the roll caught the phase walk's uniform-pool fallback
BYPASSING H3 (postchorus after postchorus) — `lawful()` now guards every
road that can pick a section.

**And the second plan detonated three latent blend defects**, all fixed and
all now guarded by the restored 504/504 + 20/20 blend checks: (1)
`form.plan` had to join BLEND_DRAW and the form group; (2) the group-owner
fallback-to-`first` was FALSIFIED — a plan's mere presence changes which
walk runs, so a group's absences must arrive with it (if the owner has no
plan, the blend has none); (3) `blendField`'s object recursion DROPPED
`src`, so nested single-declarer fields (form.payoff) resolved by
coincidence — the source indices now go down with the values. Plus the
third pass of the integer-domain lesson: an all-seven blend averaged
`rideEvery` to 0.8 and wrote a ride onto step 15.2 — rideEvery, crashStep,
rim, clap, poly and play are all drawn with the kit now.

**The CS-80 ribbon research is done and the redesign is written** —
`docs/genre-research/cs80-ribbon.md`, from the user's report that
bladerunner "only does pitch bends and this is wrong". The research
confirms it in five facts: the ribbon is relative with no centre; range +1
octave up but down to SUB-AUDIO (the signature dive is asymmetric); it
SNAPS BACK instantly on release (trills); it can drive the FILTER instead
of pitch ("other sounds that did not sound just like a pitch bend"); and
chord-wide vs melody-over-chord modes. The current initBend-on-every-note
scoop and symmetric ev.ribbon bend match none of these. The gesture
vocabulary to build is in the doc: dive, scoop, trill, fall, filter-sweep,
whole-chord dive — riding over the aftertouch brightness that is already
there.

**IMPLEMENTED at `2026-08-02e`.** The hand draws a gesture KIND per bar from
the genre's `ribbon.gestures`: bend (the old move), fall (phrase-end
descending slide, late-bar anchored), dive (down most of an octave or more,
riding out), trill (instant taps with the snap-back that makes them
possible), sweep (the same hand on the FILTER — `targ:"filter"`, realised as
a 0..1 ConstantSource summed onto each layer's cutoff, the aftertouch
pattern). One realiser (`ribbonFreq`) serves the CS-80 and the plain lead so
the vocabulary cannot fork. The every-note initBend scoop is now
phrase-gated on the lead (`ev.art === "breath"` only — the sax articulation
model read by a second instrument); keys keep the documented chord twang.
MEASURED: bladerunner 17.7% of lead+keys notes carry a gesture over 30
seeds (bend 845 / fall 985 / sweep 523 / trill 319 / dive 362 — the chord
notes of a dive bar all carry it together, which is the polyphonic
glissando); synthwave 10.3%, sweep-dominant, no dive by design. The sweep
A/B (probe in scratchpad, worth promoting): cs80 >2 kHz share 3.9% → 2.1%
with rms flat; the plain lead 1.3% → 1.0% — present, weak, its voice is
already dark [CHOSEN whether that is enough]. 300 bladerunner + 300 synthwave
seeds moved, no other genre; re-baselined `b42098859fd1aecf`. The A/B probe
also caught a real crash before it shipped: the sweep's ConstantSource
joined V.lead's `nodes` BEFORE the vibrato loop, which connects to every
node's `.frequency` — a ConstantSource has none. **What is NOT measured:
whether it sounds good. The user judges; the numbers only say the
gestures exist, differ, and reach the samples.**

**Bladerunner's plan landed at `2026-08-02f`** —
`docs/genre-research/bladerunner-form.md`, from the Nemo Studios archive
and Jamieson's cue analysis. The method IS the form: improvised to picture,
first takes, "not on paper but on tape" — so the plan is one arc: drift
(the rubato bed, biggest budget) → statement (the theme "picks up around
2:23" of a 3:42 cue, so the arrival is late by construction) → away (the
Blush Response reharmonised departure) → return, ends on chorus
("apprehensive and doubtful to confident"). 300/300 bladerunner seeds
moved, nothing else; baseline `c7eaa86bd6caf213`. TWO REAL GAPS written in
that doc, deliberately not acted on: two-chord harmonic stasis (Blade
Runner Blues — belongs to the harmony work), and RUBATO — free tempo
inside a section, which no mechanism here can express; groove jitter is
not it. Three genres now have plans: lofi, synthwave, bladerunner.
Remaining: dkc, acid, plastikman, jungle (still wearing acid's tables).

**JUNGLE GOT ITS OWN ARCHITECTURE at `2026-08-02o`** —
`docs/genre-research/jungle-form.md` (KAN Samples bar-by-bar + EDMProd +
drumtrip for the dubplate-culture WHY). The two-drop DJ architecture:
buildup -> 48-64-bar drop (two 32-bar chorus halves) -> mid -> 16-bar
breakdown (bridge; the drums leave) -> rebuild -> second drop ending on
the peak (harder by construction: chorusPeak energy + arc apex) -> outro.
MEASURED: 11 distinct shapes in 25 seeds with real repeats (4x/4x/3x),
256-336 bars = 5-7 minutes, the sources' own band. **The acid<->jungle
twin defect is DEAD: nine identical whole-song records -> zero.** 300/300
jungle seeds moved, nothing else; baseline `4913a52acdb891e2`. One new
coincidental dkc<->bladerunner twin (1 word+length match between two
PLANLESS genres) — expected to vanish when they get plans. Remaining
planless: dkc, acid, plastikman.

**THE MATRIX MIXER LANDED at `2026-08-03a`, AND A REAL RUNAWAY CAME OUT
FROM UNDER IT.** The user, with a photo of a Doepfer A-138m: *"The only
thing you need to do is build the matrix mixer, you need to research how
they work and answer why would we want one."* Research first:
`docs/genre-research/matrix-mixer.md` (the A-138m's own page, matrix-mixer
guides, EMS VCS3 pin matrix, King Tubby, eurorack feedback patching).

1. **The KAOSS pad was tested** (user: "I've been unable to notice its
   work"), with a new probe, `harness/probe_kaoss.js`. VERDICT: the pad
   WORKS end to end — a real pointer drag on the pad writes the TRIMs and
   audibly stretches the live stop-tail (4.2 s -> 5.8 s at -50 dB) — but
   the thing it modulates is nearly inaudible at the genres' own send
   levels. Measured as a DIFFERENCE SIGNAL (corner render minus neutral
   render, level relative to the mix): the pad's loudest possible move is
   -8 dB (plastikman) down to -28 dB (synthwave, FAINT). Total-RMS deltas
   lie here (<= 0.7 dB); the difference signal is the honest measure.

2. **WHY A MATRIX MIXER — the user asked, and the answer is a defect.**
   The most famous gesture in this lineage, described knob by knob:
   Tubby *"opens the aux send on the drum track with his left hand and
   closes the volume of the drum track with the right hand a split
   second later, resulting in the drum track being echoed and
   disappearing"* [corpus:interruptor.ch dubboard]. Two crossings of ONE
   ROW, opposite directions. **The program could not make that move,
   because a bus's DRY level did not exist as a control anywhere in the
   file** — all four role buses hit the mix at a hardcoded gain of 1 and
   nothing rode them (verified by search before building). The drop, the
   oldest move in this music, had no knob.

3. **THE MATRIX AS BUILT** — `INSTRUMENTS.matrix`, a fixed machine: FOUR
   sources (the role buses) x THREE destinations (MIX / ECHO / ROOM) =
   twelve crossings, plus the `roomEcho` feedback crossing. A fourth
   column would be an invention; the program has two effects and one mix.
   - Graph: `g.route` holds every crossing. The dry column replaces the
     hardcoded `connect(g.mix)` loop — drums join it AFTER the drum bus's
     saturation, so pulling the kit's dry fader makes it quieter and
     never makes it distort differently. `g.roomEcho` wires verb -> echo.
   - NEUTRAL IS THE OLD WIRE: every dry base is 1.0, a gain node at 1.0 is
     transparent, and the 2100-seed snapshot stayed IDENTICAL.
   - Route bases derive from the SONG's space object + hand TRIM in
     setSpace (the kick precedent — PARAMS holds the last genre loaded and
     a batch render must not wear one genre's routing thrice); applyRack
     mirrors them into PARAMS so the panel reads true; `soundOf` sets
     `echoKill` on an emptied fx rack (send routes to 0 past any TRIM,
     while the DRY column is never killed — an empty rack is a dry mix,
     not a silent one).
   - The genres ride it: **jungle** drops `drumsDry` in the bridge while
     `drumsEcho` rises — its own research already quoted KAN's *"drums
     often drop out entirely"*, and jungle is sound-system music, so the
     engineer's move belongs to it; **plastikman** pulls `bassDry` and
     `keysDry` off the mix as its "year of subtraction" (underdog: "cut
     that to create space") plus its five send routes and `roomEcho`;
     **lofi** does a fraction-sized Tubby pair at the outro
     (`leadDry`/`leadEcho`); **bladerunner** breathes `keysRoom`/
     `leadRoom`. Shapes sourced, amounts mine, all marked [CHOSEN].
   - MEASURED (probe_kaoss part 3): the KAOSS pad's whole travel was
     -8 to -28 dB relative to the mix because nothing could open the echo;
     with one matrix route opened on lofi the pad swings -9.9 dB. The pad
     was never broken — it had nothing to work on.

4. **THE RUNAWAY: WebAudio lowpass/highpass Q IS IN dB.** Found by
   `harness/probe_matrix.js` while measuring the roomEcho governor: the
   worst-case tail GREW even with the crossing severed, on the PRE-matrix
   build too (worktree A/B on 268ba5d). `echoLp` Q "0.6" / `echoHp` Q
   "0.5" were written as textbook quality-factors, but for these filter
   types WebAudio reads Q as DECIBELS OF CORNER RESONANCE — measured with
   getFrequencyResponse, x1.21 each and x1.344 for the cascade, so FDBK
   0.85 became a loop gain of 1.14. A single kick rang UP +18 dB over
   30 s, +36 dB with the repeat-cut at 600 Hz. **This is very probably
   the user's long-standing "it starts to build and the program starts to
   stutter and glitch out" report.** FIXED at Q = -3 dB, where the
   measured cascade peak is exactly 1.0000 — a passive knee, so loop gain
   can never exceed the FDBK dial. VERIFIED after the fix: with the
   crossing severed a maxed echo decays to digital silence where it used
   to climb. Every other Q in the file is a colour on a ONE-WAY path and
   was deliberately left alone; only a filter inside a loop has a
   stability duty.

5. **THE GOVERNOR, SWEPT on the fixed build** (worst case: FDBK 0.85 +
   WASH 1.0 + SEND 1.0 + a route wide open, one kick, 30 s): 0.04 decays
   to silence, 0.08 decays monotonically, **0.12 falls then CLIMBS BACK
   (-46 -> -35 dB)**, 0.16 and 0.20 run away. `matrix.roomEcho` max is
   therefore **0.08**, the largest swept value that never turns around,
   and setSpace clamps to `CONTROL[...].max` rather than to a second copy
   of the number. plastikman declares 0.04 with rides sized to land near
   0.07, so the lane never lives pinned against the stop. The crossing is
   still plainly audible there: -23.6 dB of difference signal vs severed.
   probe_matrix's pass criterion was also rewritten — a fixed -60 dBFS
   floor was unreachable (FDBK 0.85 rings past 30 s legitimately); it now
   requires the tail to be 20 dB below its own post-source peak AND still
   falling in the last third, which is what "runs away" actually means.

6. **BATTERY:** snapshot IDENTICAL (2100 seeds, `a687db612285f96d`),
   mk2_ui 26/26, mk2_blend 10/10, mk2_test 118/118 — but note mk2_test
   needed `node --max-old-space-size=3072` once after an exit-137 OOM
   under load. The swing check earned its keep here: it caught
   `plastikman.matrix.drumsRoom` doing NOTHING at seed 1, because a
   `section` move keyed on bridge/intro is dead on a song with neither
   and plastikman has no form plan yet. Fixed with a slow LFO underneath.

7. **THE GRID WAS REBUILT AS A GRID at `2026-08-03b`, after the user saw
   it.** Three corrections, all fair: *"it looks nothing like the image,
   we want a clone"*, *"I'm not sure you understand what the matrix mixer
   is for"*, and *"why have you built it in a way that it can not be
   altered... should you make it so more can be added"*.
   - **IT IS A DECLARATION NOW.** `const MATRIX = { ins, outs, alias,
     none }` is walked by the controls, the graph, the automation and the
     panel. Adding an input is ONE entry plus ONE line in
     `matrixSource()`. The first cut hardcoded four sources in five
     places — the "baked-in values" the first principle is against.
   - **THE RETURNS ARE ROWS**, which is the part I had wrong about what a
     matrix mixer is FOR: "inputs can be sent to multiple effects, and
     THE EFFECTS CAN BE SENT TO EACH OTHER, AND EVEN BACK INTO
     THEMSELVES" [corpus:signalsounds]. So the grid is 6 x 3, not 4 x 3.
     `echo x echo` and `echo x room` are ALIASES onto the echo's existing
     FDBK and WASH dials (displayed in the grid, not re-keyed — seven
     genres name those controls by hand); `room x mix` is `space.wet`,
     which stops being a number only the song could write and becomes a
     knob; `room x room` is a blind plate with its reason in the title.
   - **THE PANEL IS DRAWN AS THE MACHINE IS DRAWN** — `skin: "a138"`,
     `grid: "matrix"`, brushed aluminium, gold-ringed jacks down the left
     and along the bottom, a knob at every crossing, nameplate below. The
     old panel was three labelled knob clusters in the desk skin, which
     is precisely what a matrix mixer is not: here the LAYOUT IS THE
     INFORMATION. `matrixGridEl()` walks the same MATRIX declaration
     buildGraph wires from, so a row cannot exist in the audio and be
     missing from the panel. Cells are ordinary `knobEl`s, so drag,
     double-click release, TRIM and the automation readout are the shared
     ones and this panel owns no behaviour.
   - New riders, both demanded by the seam law: **plastikman roomMix**
     (the sourced "reverb send increases to open up space" for
     breakdowns, and the file's own sentence about this record — "what
     subtracts is the KIT, while the space fills in behind it" — which
     describes a reverb return climbing and had no knob until now), and
     **jungle echoMix** (holding the echo return down under the verse so
     the throws land in the drops; its own comment already says its delay
     is "a thrown thing, not a wash").
   - Battery: snapshot IDENTICAL, mk2_test 117/118 (stamp only, bumped
     after), grid renders 6 rows / 3 columns / 17 knobs / 1 blind, no
     page errors.

8. **⚠ CORRECTED, AND THE CORRECTION MATTERS MORE THAN THE ENTRY IT
   REPLACES. The previous version of this item claimed the rendered audio
   had ALWAYS been unrepeatable — a pre-existing, project-wide defect.
   THAT WAS WRONG. I caused it, in this session, with the room→echo
   crossing.** What misled me: a comparison worktree I had labelled
   `268ba5d` but had already checked out to `f16454c`, so every "before"
   render came from a build that already had the cycle in it. The label
   was wrong and I read the result as history instead of as my own change.
   Chased to the end at `2026-08-03c` (the user: "chase it all the way and
   fix it"):

   - **The cause is a CYCLE, not a node.** The echo already feeds the room
     (the WASH dial), so a room→echo crossing closes a loop. With that loop
     present, Chromium renders the same song differently every time. It
     fires **even with the crossing's gain at ZERO** — the connection alone
     does it. Reproduced in ~40 lines of plain WebAudio with no program
     code involved.
   - **Five topologies, all equally bad** (worst of five renders, against
     -159 dB with no crossing at all): straight off the convolver -23.3,
     through an extra delay -21.5, tapped BEFORE the convolver -21.3,
     through a second dedicated convolver -23.3, and through a plain
     biquad with no convolver in the loop at all -21.3. So it is not the
     reverb. A bare delay-and-gain feedback loop is perfectly repeatable
     (-325 dB), so the engine can do feedback — it cannot do a cycle
     spanning the echo's filter chain and the room bus and land on the
     same samples twice.
   - **The true baseline**: `268ba5d`, actually checked out, renders
     repeat-to-repeat at **-115 dB** — inaudible, ~19 bits down. The
     build with the cycle: **-35 dB**, which is audible. Now, with the
     crossing removed, the seven genres sit between **-92 and -106 dB**.
   - **THE FIX: the crossing is gone**, a blind plate in `MATRIX.none`
     carrying the measurement. Law 7 is "same seed, same samples", and
     every A/B, every audio assertion and every claim that a change did
     what it says rests on rendering being repeatable. A feature that
     makes the renderer unrepeatable does not cost one feature, it costs
     the ability to measure anything — including itself. plastikman's
     `space.roomEcho` and its motion lane went with it.
   - **THE GUARD: `harness/probe_render_determinism.js`**, new. Renders
     the same events three times per genre and demands they match within
     -80 dB (measured floor -92..-106, a cycle -35, so the threshold sits
     in a 45 dB gap near neither end). This is the check whose absence let
     the regression in, and it is cheap. **Run it after any change to the
     audio graph.**
   - `harness/probe_matrix.js` was repurposed: the governor it used to
     measure no longer exists, so it now proves every crossing of the grid
     changes the sound. It decides which buses are even sounding in its
     excerpt BY MEASUREMENT (if closing a bus's MIX fader changes nothing,
     that bus had nothing to close) rather than by matching event `role`
     tags against bus names — the first version did the latter and
     reported live crossings as dead, because roles like `ostinato` and
     `pad` share the keys bus. Verified: all 15 crossings audible across
     plastikman + bladerunner (-3.5 to -31 dB).
   - **The methodology lesson, which is the durable part:** an A/B without
     a same-build control measures its own noise. Two separate mistakes in
     this session were caught only by running that control (the UI-driven
     genre switch racing its own recompose, and the mislabelled worktree).
     Past entries in this file argued from render A/Bs with no control —
     they are not thereby wrong, but they are unverified in this respect.

9. **STILL OPEN:** the 8 pre-existing `render_audio.js` failures
   (documented in the `2026-08-02p` entry) have not been re-checked
   against this build, and per item 8 they should be re-checked WITH a
   control.

**THE SAX DRAWS WERE ZEROED at `2026-08-02p`** — the user, plainly: *"Can
you pull the sax out for now."* The two one-line edits the parked warning
(§ below) had already named: lofi's `machines.lead` [auto 7, sax 3] and
bladerunner's [sax 5, auto 5] both became [auto 1], with the old weights
kept in comments beside them. The `lead` key stays DECLARED in both
genres so the rack stream's draw count does not shift under the other
machines, and the horn stays hand-pickable everywhere (`canFill` — the
seam check now enforces drawn-by-NOBODY while parked). Isolation
measured: bladerunner 153 + lofi 84 of 300 seeds moved (their former sax
songs; matches the old 5-in-10 and 3-in-10 weights), the other five
genres identical seed-for-seed. Baseline `a687db612285f96d`. KNOWN,
PRE-EXISTING, unrelated (proven identical at the prior commit in a
worktree A/B): the no-argument `render_audio.js` run (3 songs, 551
assertions) fails 8 audio checks — sub-runaway over the 25% tr1000
ceiling in five sections, one kit-free prechorus with kit energy, seed 2
kit in/out contrast, seed 3 loudness-vs-energy r 0.627. The handoff's
documented 2-song run was the green one; these 8 belong to whoever next
touches the mix, with this measured starting point.

**THE RIBBON CORRECTION at `2026-08-02g` — read this as method, not as a
changelog.** The user rejected the gesture vocabulary the same day it
shipped: *"no one was using pitch bends and these quick things... it
doesn't sound different from before."* They were right twice. The trill
was never sourced on this score (instrument capability + Vangelis's hands
= an imagined mechanism, HANDOFF §5.4a's exact error class). And the real
expression was never in the events at all — the amp attack was hardcoded
0.10-0.20 s under a comment CLAIMING "the slow swell the instrument is
known for." Ornaments on an unchanged fabric are inaudible as change. The
fix: cs80 gained atk/rel voicing controls (defaults reproduce the old
constants bit-for-bit; only a genre that asks blooms), bladerunner asks
(atk 1.10 s / rel 1.60 s, atLevel 0.20 → 0.55 — the swell is loudness as
much as brightness), and its gesture list is slow-only (sweep 1.4-2.8 s,
dive 1.2-2.5 s, fall 0.5-1.2 s; no trill, no quick bend). MEASURED across
builds (worktree A/B, probe_bloom in scratchpad): a keys chord reaches 90%
level in **1.38 s where it took 0.22 s** — the bloom is real. 300/300
bladerunner seeds moved (ribbon events), nothing else; baseline
`f95f55acfa205b8d`. The user's a verdict on it remain the judge of whether the bloom
is enough.

**THE SAX ENDS ITS NOTES at `2026-08-02h`** — user: *"it plays notes that
just stop"*, and they did: a flat 0.14 s release on every non-staccato
note, with nothing marking phrase ends. Researched (sax-playing.md
addendum): the breath ends the note ("a tail off rather than an abrupt
stop"), the vibrato outlives the tone ("carries on with just the breath"),
jazz has the falloff release (a soft downward glissando on release), and
subtone is register AND volume. Built: `articulate()` marks the note
before a rest — `tail: "taper"` or 28% `"fall"`; the voice tapers over
0.30-0.75 s with brightness closing and vibrato deepening, or falls with
the per-note falloff; low notes played softly get ×1.6 air and 28% darker.
MEASURED (probe_tail, scratchpad): note-end to −30 dB — plain 130 ms,
taper 310 ms, fall 210 ms; 49.2% of bladerunner lead notes are
phrase-final and carry an ending.

**THE SAX ENGINE BUILD BEGAN — step 1 of 5 done** (see
`docs/genre-research/sax-engine.md` for the design and the build order).
`corpus/analyze_sax.py` downloads nothing to the repo (AIFFs stay in
`corpus/sax/iowa/`, gitignored) and derives `corpus/sax/saxwt.js`: 24 KB
of per-pitch, per-dynamic harmonic tables from the Iowa alto NoVib set —
32 pitches × 3 dynamics, every slice pitch-verified within 60 cents,
one extra slice in pp.C5Ab5 caught by the count check and harmless.
THE COUPLING IS IN THE NUMBERS: harmonic centroid 1.90 → 2.29 → 2.61
across pp/mf/ff (the breath brightens the spectrum), attack 0.33 s at pp
vs 0.075 s at ff (soft notes speak slower — the bloom is the horn's own),
rms 0.032/0.094/0.152 (real loudness relations). Caveat marked in the
table header: `noise` is residual-beyond-24-harmonics, an upper bound on
breathiness, not pure breath. **STEPS 2, 3 AND 5 LANDED at `2026-08-02i` — THE ENGINE IS LIVE.**
SAX_WT (24 KB) is embedded; stage 5 attaches each phrase to its opening
event (frozen events are REPLACED with augmented frozen copies — the
freeze makes no exceptions); dispatch renders each breath once (member
events are skipped for voices with `.phrases`); and V.sax is the phrase
engine: three phase-locked oscillators carrying the real pp/mf/ff spectra
of the phrase's median pitch, crossfaded along a dynamics stream (the
morph is phase-coherent because same-frequency WebAudio oscillators hold
phase), real loudness trims (sqrt-compressed [CHOSEN]), the pp attack times
from the horn itself, slurs as glides on one envelope, tongue strokes as
25 ms dips in the same airstream, tapers that darken by morphing toward
pp, subtone as a pull toward the pp spectrum, the reed beat as a 5-cent
mf copy, growl/air/vib/scoop/fall all rewired and alive. The formant
biquads are gone — the tables were recorded through the horn's body.
MEASURED: a slurred 3-note phrase renders ONE attack (the claim, on
samples); loudness follows gain 0.068→0.42 rms; brightness rises toward
ff (weak pp→mf at pitch 60, honest); bare events (probe_voices, UI sweep)
render as one-note phrases so every harness still fires the voice.
ALL SEVEN GENRES offer the horn (three new seam checks, incl. the
member-for-member phrase partition: 1012/1012 over 10 forced-sax seeds).
605 songs re-drew across all genres (new lead draws shift the rack
stream; sax songs gained phrase fields) — re-baselined `2292860b0a5f9325`.
**THE SECOND HORN landed at `2026-08-02j`** — the user: "why would we
leave it up to just one version." Weresax (Karoryfer, CC0, 384 MB cloned
locally, never committed) analyzed through the same pipeline: its
filenames are an OCTAVE BELOW sounding pitch, proven by measurement (the
a2 file carries a full series on 220 Hz, nothing at 110/330; 64/64 files
pass the 60-cent gate as name+12). Two recorded dynamics (p, f) → pp/ff;
mf is the per-pitch mean, MARKED derived. SAX_WT is two characters now
(47 KB total); the sax panel has a HORN switch (switch by contract — a
different horn mid-song is a different instrument). Measured: spectra
L1-distant 0.51 near C4, A/B renders differ in brightness at equal level.
Snapshot IDENTICAL — the switch is panel-only, alto is the default, and
the regenerated alto tables are bit-identical.

**THE PLAYER landed at `2026-08-02k`, and the default-on was reverted.**
The user, after playing it: not on by default ("if it's going to be on
something it needs to be there for a reason"), and "you didn't create a
sax player — it still sounds like a keyboard." Both correct. MEASURED:
composed gains cluster 0.56-0.85, so the morph position sat at 0.44-0.79
— the engine carried real pp and ff spectra and the performance NEVER
WENT THERE. The player is pure arithmetic on the phrase, zero draws:
quiet into the line, crescendo to its peak note (the longest, ties to
highest), easing out; any note over 1.1 s carries a messa di voce
[corpus:wikipedia/Messa_di_voce] — swell, brighten, ease, all inside the
note; and the breath's loudness follows its position so the arc is heard
as level too. Morph travel after: 0.00-1.82, quartiles 0.13-1.31. A held
2.6 s note renders rising +1.9 dB through its middle and dying to
nothing through the taper. The five default draws were REMOVED: the
horn is hand-pickable on every genre through the rack, and the conductor
draws it only where a documented reason stands (bladerunner: the Love
Theme IS a sax; lofi: its own lineage — both pre-existing). The seam
check now enforces exactly that.

STILL OPEN, honest: step 4's flutter/overblow are NOT built (no sourced
per-genre behavior yet — adding unridden gesture knobs would fail the
battery's own contract); the per-phrase single wavetable region is an
approximation marked in the voice; Weresax's mf is derived, not recorded;
and the deepest remaining gap is the MATERIAL — the notes the composer
writes for the lead are instrument-agnostic theme notes, not lines a horn
player would choose (breath-length phrases, pickups, runs, held peaks).
That is stage-3 work, a sax-aware theme style, and it is the next thing
that would move "sounds like a keyboard" further. The user judges.

> ⚠ **THE SAX IS PARKED — the user's verdict, 2026-08-02, after all of the
> below: "It's bad, really really bad, nothing at all like a sax. Let's
> just drop it for now."** Read that against the numbers underneath it:
> every target was hit, every battery green, one attack per phrase proven
> on samples, stability past the corpus figures — and the owner failed it
> anyway. That is the project's own §0 law working in the hard direction:
> the numbers only ever said the gestures exist and reach the samples,
> never that it sounds like a saxophone, and it does not. DO NOT claim the
> sax works. Do not spend more sessions polishing it incrementally either
> — three rounds of that preceded the engine and two followed it. If it is
> ever picked up again, the honest options are real multisamples at real
> payload cost (§9.5 arithmetic) or a true waveguide model, both weighed
> against the user's a verdict on it early, on a single exposed note, before any
> system is built around the tone. The research (sax-engine.md,
> sax-material.md, sax-playing.md) and the corpus pipelines remain sound
> and measured; the phrase/lines architecture remains in place and
> harmless (only sax-voiced events use it). The horn stays hand-pickable;
> lofi and bladerunner still draw it — if the sound offends before it is
> fixed, zero their `machines.lead` sax weights, two one-line edits.
> **DONE at `2026-08-02p`, on the user's word ("pull the sax out for
> now"): both weights zeroed, drawn nowhere, hand-pick intact. Restoring
> any draw weight is un-parking — it goes through the owner-gate above.**

**THE HORN LINES landed at `2026-08-02m`** — with a correction the user
made before the build: the corpora are SOLO-biased (WJazzD is literally
solos; the Omnibook mixes themes into solos with no markers), and *"a sax
solos while important is only part of the whole of a sax playing."* Our
lead role is a MELODY. The role split is in sax-material.md: phrase
ARCHITECTURE transfers from the solo data (and gets stronger for
melodies), bebop DENSITY does not — density stays the genre's.
`INSTRUMENTS.sax.lines` is read by buildTheme through the same door as
`range`; every LINES-only draw is gated so non-horn songs draw exactly
what they always drew (proven: only bladerunner 153 + lofi 84 moved).
Built: notes sustain to the next onset (≤12 sixteenths) so articulate
hears one breath per phrase; ~26% pickup rolls (2 sixteenths early, a
step below, hook bars exempt so restatement stays exact); strong-beat
and long-note candidates snap to chord tones at the CHOICE (hang
resolutions outrank). MEASURED on lofi over 30 seeds: phrases 287→244,
median 4.4→6.1 beats (target 6-16), strong-beat stable 95.2%, long
96.7%, phrase-final 96.7% (targets 84/85/90); pickups realise 8.2%
(fits() blocks some; a taste dial, [CHOSEN]). Hook exactness 300/300.
Baseline `777822852856afc1`. STILL OPEN: fills-between-phrases and
background-pad roles (arrangement-level, in sax-material.md); Weresax mf
derived; flutter/overblow unsourced.

**AND THE SNAPSHOT WAS BLIND, third time, now closed for the class.** The
tail work shipped BYTE-IDENTICAL through mk2_snapshot because the hash
read a hand-listed field subset — extended once for ribbon/press, still
missing art/from/vib/tail. The whole articulation model was never in the
snapshot. The serializer now DERIVES the field list from the event itself
(every field, recursive, keys sorted): a field added tomorrow is hashed
tomorrow by construction. Re-baselined `364945a3ad127a4b` — an instrument
change, not a music change: the old subset read IDENTICAL across the sax
work, which proves pitch/timing/gain/ribbon/press did not move while the
new fields landed.

### 2026-07-31 — the session that ended at `7c7644b`

Read this first; the rest of §4 is older and still true.

**The saxophone learned to phrase.** It was reported as sounding bad, and the
cause was not the oscillator: every note got the scoop, the breath transient and
the full attack that belong to the *first* note of a phrase. The measurement that
set the priority — people playing it confuse *legato* with *portato* ~25% of the time and
*staccato* with either **<1%** of the time
([PMC4097958](https://pmc.ncbi.nlm.nih.gov/articles/PMC4097958/)) — says the owner
reads a wind instrument through its **gaps**, not the spectrum of one note.
`articulate()` now runs on every theme the way `acidize()` runs on every bass:
slur stepwise, tongue after a leap, detach a short note with room after it. The
25.5 ms tongue contact is a **gesture** (constant, in the voice); the 25–29%
staccato gap is a **proportion** (scales with tempo, so it rides on `artic` in
stage 5). Plus delayed *downward* jaw vibrato and register-dependent brightness.
**0% → 46.9% slurred.** Full write-up: `docs/genre-research/sax-playing.md`.

**The rack became a user-managed list.** Four by default — drums, bass, lead,
**fx** — drawn from `RACK_ON`, not from markup. Every rack has **none**, a **×**,
and a **+** that adds any rack not shown. The echo/room unit stopped being a
fixture and became the fx rack. Any pitched box can fill any pitched rack (a
Rhodes or a 303 on the tune). **"None" is a MUTE, not a pick** — written as a
pick it changed bladerunner's counter-line, because the sax declares a range and
the tune narrows into it, so emptying a rack *recomposed the record around the
hole*. The draw still runs; the mute rides beside `drumKit` in `picks`.

**Minimal techno got the polymeter its own table had claimed for months.**
`kit.poly` gives a drum lane its own **length**, counted in absolute steps so it
crosses the bar line — rim at 7, clap at 5, both coprime with 16. See §0 for how
that was found. Plus `poly[].phase`, drawn per song from a **named substream**
(never from the shared `rng` — the ostinato ratchet took one draw from that and
moved 882 of 2100 snapshot seeds).

**And something answers.** `kit.answer` — a rule watches a set of lanes, counts
what it hears, and writes on every Nth, with **zero random draws**. Booth's
sentence, finished: a rule that turns two sequencers disagreeing into a
two-stroke rimshot, and a second that **counts those rolls** and grows every
third into a three. Every design decision came from `probe_novelty.js` *before*
the shape was chosen — the person playing it on ONE lane scores 0.000 (counting a periodic
thing gives a periodic thing), and the `notOn: ["kick"]` guard that protects the
downbeat is itself worth 0.500. **The constraint is the generator.** Full
write-up: `docs/genre-research/the-part-that-answers.md`.

**Autechre research, and a correction I got wrong twice.** They are not IDM —
Booth calls the term *"silly"* and *"a purely American invention"* — and I had
used it as a genre label without checking. They came out of Manchester electro
and were, on signing to Warp, *"not far removed from acid house and Detroit
techno"*, which is where Hawtin comes from too. The work belongs **in**
Plastikman, not beside it. Also deepened that genre's space, which measured
mid-table against its own sources (*"an album of feedback"*, *"kick drums bathed
in suffocating reverb"*): reverb return **+61%**, tail **+64%**, RMS flat, zero
clipping. `docs/genre-research/autechre.md`.

**Eight rendered-audio failures fixed** — see §0. Two were real defects in the
music (the arc peaking before the record did; every genre sharing one kick), two
were stale strings in checks, and the rest were checks that could not see what
they were looking at.

**iPhone audio, twice.** Web Audio needs `ctx.resume()` awaited *and* the
context resumed inside the tap. Then a fix for the **ringer switch** — which
silences the ambient audio session at any volume with no error — broke it,
because `HTMLMediaElement.play()` **consumes the user activation on iOS** and it
was being called before `resume()`. Now `resume()` is called first and
synchronously, the silent element is opt-in behind a button, and the transport
prints the context state so a phone with no console can say why it is silent.

**Two things measured and removed**, because an effect nobody can measure is not
a feature:
- a **tuned reverb** (a comb at the period of the root — Booth tunes delay lines
  to a track's harmonic content). At a usable level it moved the tonic band
  ×1.01; at an audible level it flooded the limiter and dragged the tonic *down*.
- a **syncopation ceiling** (Longuet-Higgins & Lee). LHL assumes a complete
  rhythmic surface — a lone note in an empty bar scores **15, the maximum** — so
  it is the wrong instrument for a sparse ornament lane. The index survives, in
  the battery, asserting that the *union* stays at 0.

### The composition side

- **Six-stage pipeline complete**, seam-checked, deterministic per
  `(seed, genre, rig, picks)`.
- **Seven genres in the `GENRE` table:** `lofi`, `synthwave`, `dkc`, `bladerunner`,
  `acid`, `plastikman`. Each carries ~30 fields — tempo bands, modes, rig
  weights, form grammar, progressions, registers, groove (swing, dilla
  displacement, jitter, push, lane lean), kit (ghost placement, open-hat spots,
  flourishes, toms, variants), counter style, bass style, theme density,
  ostinato, space, kick voicing, drum drive, gate, machines, params, motion.
- **Rigs:** `band`, `sega` (YM2612 + PSG + DAC), `neon` (CS-80 comp),
  `nemo` (CS-80 + VP-330 + Prophet drone, no drum kit), `box` (808 + clap +
  303), `plastik` (808 + rim + sub drone + acid ostinato).
- **A full tom kit** — 12"/14"/16" — and a **gated reverb** built the way
  Padgham/SSL actually did it: a compressed bright room, then a hard gate
  (hold ~150 ms, release ~15 ms). The compression is *half the sound*; without
  makeup gain the whole effect was inaudible, which is how the first two
  attempts failed. The drummer's tom appetite is a genre parameter.
- **`MK2.toMidi(song)`** — SMF type 1, 960 PPQ, one track per role.
  Round-trip-verified against the event list in the seam battery.

### The sound side

- **Drum bus:** `bus.drums → drumDrive → drumPre(0.5) → tanh(3.6x) →
  drumMakeup(1/1.8) → mix`. The makeup exists because inserting the saturator
  made every drum 5.1 dB louder — drive must be a *timbre* control, not a
  loudness control. That lesson is applied again inside the 303.
- **Voices:** acoustic kit, SEGA DAC/PSG kit, sub bass, YM2612 FM
  (bass/keys/lead/counter), Rhodes (mda ePiano port), Wurlitzer, CS-80.

### The instrument rack — this session's work

- **`INSTRUMENTS`** — 17 machines across the rack's slots, each declaring its own
  controls with range, default, unit, and *what the number means*:
  - drums: `kit`, `tr808`, `segakit`
  - bass: `subbass`, `tb303`, `chipbass`
  - keys: `rhodes`, `wurly`, `mellotron`, `cs80`, `chipkeys`
- **TR-808**, built as circuits because that is what it is: bridged-T BD whose
  decay reaches 1.6 s, 2-oscillator + noise SD balanced by SNAPPY, six
  inharmonic squares for the hats (CH and OH are the *same* circuit at two
  decays), bridged-T toms.
- **TB-303**: two cascaded biquads — the filter is **four-pole, 24 dB/oct**;
  Roland's "18 dB" is marketing and Stinchcombe measured −23.9 dB/oct four
  independent ways — with **resonance in section one only**, because two
  high-Q sections multiply their peaks into a sine oscillator instead of a 303.
  Overdrive with makeup, because a stock 303 does not self-oscillate and on
  record the squeal is always into distortion.
- **Mellotron**: three tape sets, wow *and* flutter (two different mechanical
  faults), tape hiss, and the hard 8-second stop when the strip runs out.
- **The Wurlitzer is now its own instrument** rather than a branch inside
  `V.keys`, so the rack can name either keyboard directly.
- **`voiceFor(chart, lane)`** — the rig answers unless a machine has been put
  in that slot. `picks` is frozen into the chart as an **input to stage 1**,
  exactly like the rig.
- **The UI**: three slot pickers, and under them the front panel of *only* the
  machines those pickers chose. The panel is generated from the declaration —
  **there is no per-machine UI code**, so adding an instrument adds its panel.
  A slider writes straight into `PARAMS`; voices read `PARAMS` when they next
  fire, so a knob moves on the *next* note and never on one already scheduled.
- **Ownership chain**, one-directional, one owner per hop:
  `GENRE table → applyRack → PARAMS → soundOf → setSpace → graph`.
  `applyRack` only reloads when the genre or the machine changed, so a knob you
  moved survives pressing "new song". Each panel has a "reset to <genre>"
  button that forces a reload.

**Verified after the rack landed:** 39/39 seam checks, snapshot IDENTICAL over
300 seeds, page loads with zero errors, all three slots switch machines live and
every new voice dispatches and renders.

### The conductor, the motion and the panels — the session after that

Everything above described a rack the *user* drove. The composer drives it now,
and the machines have faces.

- **`GENRE.machines`** — the two seams `resolvePicks` and `applyRack` had been
  reading since the rack landed were both **empty**; no genre defined either, so
  the composer could not pick an instrument or set a panel. `machines` is a
  weighted list per slot, **drawn** on its own substream like the rig, so two
  lofi seeds can be a kit and an 808. `"auto"` is a legitimate outcome and every
  genre leaves room for it — auto is what keeps the RIG picker meaningful.
  Measured: 356 of 540 slots still fall through to the rig.
- **`GENRE.params`** — the genre's starting front panel per machine.
- **`GENRE.motion`** — the knobs move, and the song moves them. Four kinds, any
  mixture: `plock` (per step — Elektron's parameter lock), `section` (per section
  function), `lfo` (tempo-synced, optionally free-phase), `gesture` (one-shot on
  a fill or a peak). The genre declares RANGES; `makeMotion` draws one number per
  song per move on a substream keyed by machine, control and index — so movement
  is character, not chaos, and adding a move cannot shift a draw anywhere else.
- **A knob has three owners and they SUM:** `PARAMS` (genre base) + motion
  (composed) + `TRIM` (the user's hand, a signed offset), clamped to the dial.
  Summing is why the hand and the machine can both be telling the truth: grab a
  sweeping filter and it keeps sweeping, around where you put it.
- **Motion touches no note.** It reaches the sound through `P()` alone and
  derives its position by rounding `ev.tSec` to a sixteenth, so stage 5 needed no
  new field and the snapshot never moved.
- **Accent and slide** are written onto every bass note from their own
  substreams (handoff §5.1, done). The 303 finally behaves like one.
- **Pins** — a pattern typed on a machine's grid is an **input to stage 1**,
  frozen into the chart beside `picks`. Unit: one lane, one bar, one pattern.
  Seam checks run over pinned material like any other; the roll prints PINNED.
- **Five faithful front panels** — 808, 303, Mellotron, Rhodes, Wurlitzer — with
  drag-to-turn knobs carrying **two indicators**: the bright pointer is where you
  have it, the dim orange dot is where the song has it *right now*. The panel is
  DATA (`INSTRUMENTS[m].panel`), so a machine without one still falls through to
  the old generic slider list and nothing regressed.
- **The 808 and 303 have their sixteen steps**, with pattern (A/B/C/fill) and bar
  (1–4) selectors — which is both the hardware's pattern-group-then-number and
  the actual shape of the material family, since A, Avar and B share one drum
  pattern. Editing recomposes and playback resumes at the same song second.

**Verified:** 57 seam checks, 20 UI checks in a real browser, 515 audio
assertions, snapshot IDENTICAL over 300 seeds. The one deliberate snapshot move
was `GENRE.machines`: 592,057 events compared field by field, `voice` the only
one that changed (93,288 events, all machine swaps), everything else zero.

---

## 5. What needs to be done — in priority order

> ⚠ **THIS LIST IS FROM `e172eea` (2026-07-30) AND ITEM 1 IS DONE.** §9 is the
> current next job; read that first, then come back here. The rest of this list
> is still live and still in the right order. Kept because the *reasoning* under
> each item is what makes them worth doing, and none of that has changed.
>
> Rewritten 2026-07-30 at `e172eea`, after a session that moved the comp, the
> harmony, the ride, the drums and the measurement of what the genres actually
> control. This is the order:
>
> 1. ~~**BUILD THE SAX, AND THE BAND AROUND IT.**~~ **DONE** at `7c7644b`. The
>    instrument exists, it has a range that stage 3 respects, and — the part that
>    made it sound like a saxophone rather than a patch — it phrases: 46.9% of
>    lead notes are slurred where 0% were before. See §4 and
>    `docs/genre-research/sax-playing.md`. What is NOT done is samples; §9.5 has
>    the payload arithmetic and the recommendation.
> 2. **NOBODY OWNS THE FORM.** Measured with `probe_pull.js`: 15 of 16 features
>    are genre-owned at a **median pull of 19.5x**, so the seed is NOT
>    overpowering the genre — except `sections`, which scores **0.06**. Every
>    genre has the same average shape; the seed decides how a record is divided
>    while the genre decides how long it is. The user named the arrangement as
>    one of the two worst things and this is the arithmetic behind it.
> 3. **Chromaticism reaches one genre.** `harmony: {style, chance}` works and
>    Vangelis is at 10.4% out-of-key chords with the SMOOTHEST voice leading in
>    the file. Six genres are still at 0.0%, and `coltraneCycle` is built,
>    correct and **drawn by nobody** — do not claim it works until it does.
> 4. **The sampled kit is opt-in and half-populated.** `gretsch` covers kick,
>    snare, hat and ride; open hat, toms, crash and rim still fall back to the
>    synthesised voices. No genre draws the kit.
> 5. **The user's own Amen WAVs are still not in the repo.** `.gitignore` ate
>    them (§5.5) and the rule is fixed, but the files have never been pushed.
> 6. The small honest list in §5.5.
>
> §5.0, §5.2 and §5.6 are closed. They are kept in full because *how* they were
> closed is the part worth copying.

### 5.1 ✔ DONE — the 303 has its accent and its slide
### 5.2 ✔ DONE — the step sequencers, editable and pinned

Both landed. See §4. Kept here so the numbering in older notes still resolves.

### 5.0 ✔ DONE — a knob that does nothing is a lie, and now none of them do

This was the standing top priority for several sessions and it is closed. The
whole rack sweeps clean: **0 silent controls on every machine except
`tr1000.kit`**, a switch between four voice sets that a fixed-voice test cannot
see by construction.

What it took, and why it is here rather than in §4: **five separate "this knob
does not reach the sound" bugs turned up in one session and every single one was
found by the USER HEARING IT**, never by anything in the harness. That is a
class of defect, not five accidents. `harness/probe_controls.js` is the answer
to the class. What the sweep found once it was honest:

- **`bus` and `gate` on all five drum machines had never been connected to the
  hand.** `setSpace` passed the genre's argument straight to `rideBus`, so
  `panelValue(machine, "bus")` and `panelValue(machine, "gate")` were never read
  at all. Also the answer to a mystery left open the day before: driving
  `tr1000.gate` from 0 to 0.9 changed nothing, on that build and every build
  before it. Nothing read it.
- **Ten channel-strip knobs on the TR-1000 were wired to nothing** — `sTune`,
  `sDecay`, `tTune`, `tDecay`, `mTune`, `mDecay`, `rTune`, `rDecay`, `cTune`,
  `cDecay`. The kick's, both hats', the crash's and the ride's all worked, which
  is why nobody noticed. `V.s808` called `chTune()` and `chDecay()` on its second
  line, put both into locals, and **never mentioned either again** — grep says
  wired, the sound says no. The other four never asked at all.
- **The ANALOG FILTER was not in the circuit.** `g.kitFilter` was built, given a
  cutoff, ridden by `rideBus` on every song and swept by the Plastikman table
  with a 40-bar LFO — and connected to nothing. Every channel went
  `mk → g.bus.drums` direct, past it. The comment four hundred lines above it
  says "the whole kit through kitFilter on its way to the drum bus". The wire
  disagreed, and the wire is what you hear.

**Keep the sweep green.** Any new control, any new voice: run
`probe_controls.js <machine>` before you claim it works. And read §3's list of
twelve before you believe a red line.

### 5.2b The 808's hi-hat may be too dark

A/B measured, synthwave seed 2, same notes, only the drums machine changed:
above 6 kHz the acoustic kit reads **2.73–3.78%** and the TR-808 reads
**0.11–0.13%** (a kit-free excerpt reads 0.00–0.03%). So the 808 kit is present
— four times its own silence — but **twenty-five times darker** than the
acoustic one on top. A real 808 hat is bright and cutting.

The circuit is the right shape (six inharmonic squares through a high-pass, CH
and OH the same circuit at two decays). Whether it is bright *enough* is a verdict
question no battery can answer. Same for the low end: the 808 puts **four times**
the sub of an acoustic kit under an identical performance (29.4–32.8% vs
6.5–7.8% under 60 Hz). Both numbers are in `test_audio.py` with their
provenance, and both thresholds branch per-machine so a correct 808 is not
failed for being an 808. **Get a verdict before changing either.**

### 5.2c Motion values are taste, and marked as such

Every number in the three `GENRE.motion` tables and most of `GENRE.machines` and
`GENRE.params` is `[CHOSEN]` or `[GUESS]`. They are defensible and they are not
measured. They are the first thing to change if the owner disagrees. In
particular the weights that decide how often lofi reaches for an 808 (3 in 10)
and how often synthwave reaches for a 303 (1 in 2) are pure taste.

One rule the tables should keep: **a genre describes every machine it can
plausibly host, not only the ones it draws** — a hand-picked machine whose knobs
sit dead still is worse than one that is not offered.

### 5.3 All seven genres exist

`lofi`, `synthwave`, `dkc`, `bladerunner`, `acid`, `plastikman`, `jungle`.

**Jungle needed a subsystem, not a table**, because its identity is a chopped
break and everything else in this program plays lanes. What was built:

- **`AMEN`** — a transcription of the four-bar break, following Ethan Hein's
  thirteen-step construction exactly, with each step named in the comment.
  **Nothing is sampled**: there is no recording in the file and none is
  downloaded. The program synthesises the break from the grid.
- **`makeBreak`** (inside `buildGraph`) — hand-written DSP straight into a
  `Float32Array`, because `buildGraph` is synchronous and an
  `OfflineAudioContext` render is not. Kick, snare, ghost and cymbal, then a
  Schroeder network (4 combs → 2 allpass) for the 1969 room. One seeded RNG,
  so the same graph builds the same break every time.
- **`V.brk`** — plays one slice: offset, playback rate (the tempo ratio, which
  *is* the pitch shift), reverse, tone, low cut, tail.
- **`buildBreak`** (stage 3) — the chopper. Rearranging a break is writing the
  part, so it is a composition stage. Onsets come from the source's own hits;
  edits are `jump`, `stutter`, `reverse`, `thin`.
- **`gmForSlice`** — the `.mid` exports a chopped bar as the drums it is
  actually made of, by looking up what the source slice strikes.

**Why it is a buffer and not notes**, in the source's own words: *"You can't
adequately represent the Amen via MIDI or music notation. Its timbre is doing as
much musical work as the placement and timing of drum hits."* A chopped break
sounds chopped because you hear slice boundaries and room tone running across a
cut. Emitting kick/snare events instead gives fast drum programming.

**Measured:** all 39 transcribed kick/snare/ghost onsets are present in the
rendered buffer; 35 clear a crude envelope-rise detector at a mean error of
0.7 ms, and the four that do not are measurably there (−9 to −21 dB against a
quietest-detected hit of −19.1 dB) — three are ghost pickups sitting inside the
previous hit's decay, which is what a ghost is. The detector is the weaker
instrument, not the buffer.

**What reading the roll caught that no render would have**, and this is the
third time this has happened: the chopper's `jump` picked a target bar and then
a step from the *current* bar's onset list, so chops landed on steps where the
source has nothing — bars opening on room tone instead of a transient. The
`source` row in `mk2_roll.js` shows what each slice actually strikes, which is
how it was visible at all. Fixed to draw from the target bar's own onsets.

**Honest limits of this genre**, worth keeping in the table's comments:

- The break is synthesised, so it does not sound like Gregory Coleman playing.
  His microtiming is the thirteenth step of the construction and no grid holds
  it. What is reproduced is the *arrangement* of the break and the act of
  cutting it up.
- `groove.swing` stands in for that microtiming and is the wrong shape for it —
  a global ratio is not a drummer's placement.
- The tempo band `[160,176]` is `[CHOSEN]`. No corpus of measured jungle BPMs was
  gathered; do not read it as one.

### 5.4a Plastikman's bass, and the shape of a research error

Worth reading before you write another genre table, because the mistake is easy
to repeat. The research said two things: *"many of the 303 lines were pitched up
an octave"* and *Consumed* is *"driven largely by deep, rumbling basslines."* I
built a sub **drone** on the bass lane and put the 303 on the ostinato — keeping
the octave and losing the instrument. The drone restruck only when the chord
changed, and this genre's chord never changes, so **seed 1 had three bass notes
in four bars** under a record described as bass-driven.

The primary source is unambiguous: *"one of the core fundamental sounds of
Plastikman has always been Roland TB-303 basslines; it's on nearly every track
except for a couple of drum things."* Both facts are true at once — the 303
plays the **bass**, a second voice of it sits an octave and a half up as the
**figure**, and the very bottom is the **kick** (*"basslines in minimal tend to
be carried by the kicks, with the drums tuned to fill in the bottom end"*).

The fix brought one genuinely new mechanism, and it is sourced rather than
tasted: **`acidLine.avoidKick`**. *"Leaving the first 16th-note of every beat
empty is important to prevent clashing with the kick"* — under four-on-the-floor
that empties steps 0, 4, 8, 12 and the line rolls in the three sixteenths after
each kick. Acid house does **not** do this (its 303 sits on the downbeat), so
the flag is off by default and the genre that wants it asks.

**Measured afterwards**, because a C2 bassline next to a 0.60 s 808 kick is the
mix problem every one of those guides opens with: eight bars of seed 1 put
**50.4%** of energy under 60 Hz — and **taking the bass out raises it to 77.9%**.
The kick alone is 81.7%. The 303 line is what stops the genre being nothing but
sub; it does not cause it. Acid house measures 58.2% and was not touched.
Whether that is too much bottom is a taste question, not a number question — the
35% figure quoted elsewhere in this file came from a lofi/synthwave judgement and
should not be applied to a genre that is a kick.

### 5.4b The space is an instrument — the echo bus

For a long time this program had **one reverb send and no delay**, and its own
minimal-techno research said at the time: *"MK2 has ONE reverb send and NO
delay, so this single number is carrying the entire signature. It cannot."* It
was right, and in Plastikman and in jungle the space between the notes is not
empty — it is where the music is.

`g.echo` is a tempo-synced delay with **the lowpass inside the feedback loop**,
which is what makes it a dub delay rather than a copy machine: every pass loses
top and the tail dissolves instead of ending. It returns both dry and **into the
reverb**, which is the *"delays on the reverbs"* half of Hawtin's sentence.
The other half — reverb back into the delay — is **not built**; it is a feedback
path between two effects that needs its own stability work, and claiming it
without building it is not something this file does.

Numbers from the technique sources, not taste: dotted eighth at ~20% feedback,
or straight eighth at ~30%; filtered repeats; delays run into long dark reverbs.

All six controls live on a machine with `slot: "space"` and `fixed: true` — no
picker, because there is nothing to choose, but a **panel** and **motion lanes**,
because *"filters and delay feedback are modulated live, with sends ridden on
the mixer to create evolving dub mixes"* is a description of automation. Five of
the six are `kind: "bus"` and ride as curves.

**Measured**, by rendering four bars with the send at zero and at its value and
subtracting — the difference *is* the echo:

| genre | echo adds (rel. dry) | share landing >55 ms from any hit |
|---|---|---|
| **plastikman** | **−12.3 dB** | **79%** |
| dkc | −19.3 dB | 33% |
| bladerunner | −20.8 dB | 88% |
| jungle | −25.7 dB | 45% |
| acid | −26.2 dB | 58% |
| lofi | −31.7 dB | 56% |
| synthwave | −32.2 dB | 100% |

**Two measurement traps worth knowing**, because both wasted a pass. First, "%
of the bar above −45 dB" cannot answer this: a wash pad holds 99% of the bar on
its own and a 16th-note hat pattern fills the rest, so the metric reads 99%
either way. Only the difference signal isolates the effect. Second, the first
version of Plastikman's `echoFeeds` named `["keys","lead"]` — but its 303 (both
the bassline and the figure) returns to `bus.bass`, and it has no lead role at
all. The send was on, correct, and connected to nothing with gaps in it: the
measurement read **+0.0 dB**. **Check which bus a voice actually returns to
before naming it in a feed.**

### 5.4c The artist research pass — four more errors of the same shape

Plastikman's bass turned out to be on the wrong lane, so every genre was
re-researched against its named artists. **Four more errors, and three of them
are the same shape: one voice doing the job of two, or a defining mechanism
simply absent.**

**JUNGLE — the Reese.** Jungle's bass has a name, an inventor and a date: Kevin
"Reese" Saunderson, *Just Want Another Chance*, 1988, Casio CZ-5000. Junglists
pitched it down and put it under the Amen. I had a smooth Prophet-style drone.
The growl is **phase, not filter** — detuned sawtooths beat against each other
and cancel where the partials cross ("the wub wub wub sound"), and the beating
speeds up with pitch because it is between *partials*, not at a fixed rate. So
the detune is **tens of cents, not four**. Jungle also carries two low layers,
not one: the growl, plus "pure sine tones, sampled and processed through gear
like the Akai S950" as "a pulsing undercurrent below the frantic breaks."
`V.reese` is both in one patch, because the lane is one.

**LOFI — the Dilla feel was half-built.** The genre had snare-early and
kick-late and nothing else. Ethan Hein, bar by bar on Slum Village's *Get Dis
Money*: the claps on 2 and 4 are **early** ("you orient yourself around them,
and everything else sounds late"); the offbeat hi-hats are **late**; the bass is
pushed behind — "several of those notes are an entire 32nd note late." The
mechanism is an **early anchor with everything trailing it**, and the parts that
trail are the hats and the bass. `laneLean` already existed (built for Hawtin's
machine drift) and this genre wasn't using it. Measured after: **snare 38 ms
early, hats 16 ms late, bass 51 ms late.** This moved the snapshot; it was
re-baselined deliberately.

**SYNTHWAVE — the bass had no envelope.** Reverb Machine on *Nightcall*: the
verse bass "is a resonant sweep patch ... a decaying filter sweep, achieved by
setting the filter resonance high and using the filter envelope with a long
decay time to sweep the filter downwards." `V.bass` had a **static** lowpass. The
genre drew the 303 half the time and got a sweep; the other half it got a sub
with no movement in it at all. `env` / `res` / `fall` added, `env: 0` is off and
is what every other genre wants.

**DKC — wave sequencing.** Wise: he was inspired by wave sequencing on the Korg
Wavestation and "just [took] eight waveforms and played them in sequence and
that first experiment became the baseline for Aquatic Ambiance." That is a
*mechanism*, not an adjective, and it is why those pads don't sound like a synth
holding a note. `V.waveseq` is four harmonic recipes crossfading in sequence
across the note — deliberately different **spectra**, not filter settings,
because a filter sweep is not a wave sequence. DKC now draws it for half its
songs.

**One thing I checked and did NOT change:** the Dilla kick. Sources conflict —
"kick drum hits about 32nd notes ahead" and "a kick hitting 30 ms early" against
"his snares and kick drums came in a fraction of a second later." Mine sits
essentially on the grid (−1.5 ms measured) because `push` pulls the kit early and
`kickLate` only applies off the downbeat. That is a defensible middle between two
contested readings, and churning it on one source would be guessing.

### 5.6 ✔ DONE — a dissonance has to step, and what is left of it

Of the lead and counter notes **not in the chord under them**, the share that
then leapt away instead of resolving by step: lofi 34.9%, synthwave 33.0%, DKC
38.1%, Vangelis 44.8%, acid 50.0%. One of this project's own documented HARD
laws, unenforced. MK1 had a `HARD.resolvesByStep` and **never called it once.**

It is a **constraint, not a correcting pass** — nothing is moved after the fact;
when the note just written is outside the chord, the *next note's choices* are
narrowed. Three things carry it: the tune narrows its move to one scale step;
the counter narrows its candidate list and **does not play** if nothing in it
answers by step; and the question phrase now lands on a chord tone, because the
answering phrase starts fresh and cannot know what was left hanging.

```
             off      on                     off      on
  lofi     31.5%   14.0%      bladerunner     34.2%   16.1%
  synthwave 28.6%  13.3%      acid         50.0%    0.0%
  dkc      32.8%    7.7%      TOTAL        30.8%   12.7%
```

for about 5% fewer lead and counter notes.

**The measurement was also wrong, and in my favour.** Vangelis got *worse* while
everything else improved, so I looked instead of shipping the number: 205 of its
254 "unresolved" lead notes — **81%** — were followed by a REST, some of them
bars long. A note that has died away does not need answering; the probe was
counting phrase endings. There are two columns now because they say different
true things.

**What is still open here, all measured and none fixed:**

- **Zero chromaticism.** Every genre is 0.0% out of key. That is the law working
  and it is also a ceiling: no secondary dominants, no borrowed chords, no
  chromatic passing tones. Nothing in the program can currently write one.
- **5–12 progressions per genre**, and voice leading averaging 4.38 semitones.
  The proposals that were offered and never started: neo-Riemannian PLR moves,
  a voice-leading constraint on the comp, Coltrane's symmetric cycles, and
  tension tied to the arc so the harmony gets harder as the song climbs.
- **`plock` was still rare — 0 to 3 lanes per genre.** ⚠ **PARTLY ADDRESSED
  `2026-08-08i`, and the number is now MEASURED rather than remembered:**
  **15 lanes across 6 of 8 genres, 1.9% of the file's 806 motion lanes**,
  and 8.6% of the 175 controls that are read per note (which is what a
  p-lock needs). Every one fires and every one sits on a machine that plays
  in 100% of its genre's songs. Jungle's break now locks the sourced
  per-slice trio (pitch/filter/envelope) instead of pitch alone, and
  plastikman's hat locks its steps. `docs/genre-research/parameter-locks.md`.
  **Still true: the tables lean on `lfo` (474) and `section` (187), and the
  vocabulary has eight kinds.**
- **Role instances.** The user asked for "3 arps and two dueling basses" and the
  architecture has one slot per role. This needs a register allocator, not a
  table entry.

### 5.4 Genre identity, for all seven

The user's framing, which is the right one: *"lofi hip hop is defined by more
than macro constraints on sound — it's the kind of chords, the often sparse
keys; synthwave is influenced by dark new wave, Blade Runner, 80s and future;
DKC was building atmosphere."* This has now been delivered for six genres
(chords, registers, theme density, counter style, bass style, ostinato, groove,
machines, params, motion). It has **not** been done for jungle, and the drums
research was never completed. Research the artists, then put the
findings in the table.

### 5.5 Smaller, known, honest

- ✔ **`.gitignore` had a blanket `*.wav` and it ate real source.** Twenty Amen
  WAVs were "on main" from where the user sat and had never been committed:
  `git add` skips an ignored file **silently**, with nothing in `git status`.
  The rule names the render locations now and `samples/**` is kept, verified
  both ways. **The files themselves are still not pushed** — see
  `samples/amen/README.md`.
- ✔ **The build stamp is a seam now**, not a habit. The published artifact was
  found to be three program commits behind while BOTH files carried the stamp
  `build 2026-07-29r`. `harness/mk2_stamp.js` + `harness/mk2_build.json` + a
  check inside the battery. **Bump the stamp in the commit that changes the
  program, re-record, and republish** — same discipline as the snapshot.
- ✔ **A latent crash on starting mid-song.** `playLive` computes
  `t0 = currentTime + 0.15 - fromSec`, which goes negative when the song starts
  further in than the audio clock has run, and every AudioParam method rejects a
  negative time. Unreachable from today's UI; **a seek control makes it live.**
  Clamped in `rideBus` and `setSpace`.
- **`coltraneCycle` is built and drawn by nobody.** It is correct as far as
  arithmetic goes and has never made a sound. Do not claim it works.
- **`mk2_midi.js` FLAKES, about one run in five.** Observed once at `e172eea`:
  19/20 with no `✗` line surviving to the next run, then 20/20 three times in a
  row. Its checks are wall-clock — "did N notes arrive in 3 s", "did 40 clock
  ticks arrive in 2.5 s" — and a loaded machine misses those windows. **Do not
  treat a single red run as a regression, and do not treat that as permission to
  ignore it**: the right fix is to make the checks wait on a count rather than
  on a duration. Every other suite in this repo is deterministic.
- **The MIDI port has no IN**, and no per-role channel picker — it uses
  `MIDI_TRACK`'s channels so a receiver set up for the exported `.mid` is set up
  for the port. Tested through a stub device (`mk2_midi.js`, 20 checks); it has
  never met real hardware.
- **The `gretsch` kit is half-populated**: kick, snare, hat, ride are sampled;
  open hat, toms, crash and rim fall back to synthesised voices.

- ✔ `mk2_snapshot.js` defaulting to 200 against a 300-seed baseline — fixed;
  `check` now reads the file's length.
- ✔ `mk2_test.js` comparing event voices against thirteen names hand-copied into
  the harness — fixed; it asks `MK2.voiceNames()`, the shipped voice table.
- ✔ `mk2_roll.js`'s `.mid` round-trip check omitting the toms from its
  expectation, so it printed `*** MISMATCH ***` on every song containing one
  (11 on lofi seed 1, exactly the gap shown). The export was right the whole
  time. All three genres MATCH now.
- ✔ `makeChart` could not pin `rig: "neon"` from the UI — the guard read
  `rigChoice === "band" || rigChoice === "sega"` while `RIG` held **seven**, so
  neon, nemo, box, jungle and plastik were silently unpinnable: the argument was
  discarded and the genre's own draw answered. The picker listed the same two by
  hand, so the two agreed with each other and nothing looked wrong — the same
  shape as the `"auto"` bug in `applyRack`, a hand-copied subset drifting behind
  its table. Fixed at `8a4f8db`: the guard asks `RIG`, the picker is BUILT from
  `RIG`, and `RIG_LABEL` is a separate table because every key of a rig entry is
  a lane and a `label` among them would break the new invariant. Two seam checks,
  the second of which would have caught it: *every rig names every lane any rig
  names, with a voice that exists* (7 × 18, all dispatchable) and *pinning a rig
  actually pins it* (147 pins honoured). Snapshot IDENTICAL — this changes who
  plays, never what is played [Law 6].
- `harness/mk2_render.js` takes a genre argument but not `picks` or `pins`.
  **Still open.**
- `INSTRUMENTS.segakit` maps toms to the acoustic `tom1/2/3`; the Mega Drive
  has no tom sample. That is a documented stand-in, not an oversight — but if
  it ever sounds wrong, that is why.
- A **bass pin belongs to the key it was typed in.** Change seed or genre and
  root/mode change, so its absolute pitches go out of key and stage 3 rightly
  throws. `newSong` catches that, drops the pitched pins, retries once and says
  so in the info line. Drum pins have no pitch and survive. If you ever want
  pins to survive a key change, they must store scale degrees, not pitches.
- The `kit` machine's bus/gate/kick knobs reach the graph through `soundOf` →
  `setSpace`, which happens once per render. They are ridden by `rideBus` across
  the song, so they DO move with the plan — what they cannot do is change
  per-note the way a panelled machine's controls do. Know that before adding a
  `plock` to `kit.*`.
- **Non-chord-tone resolution is 12.7%, not 0%, and that is deliberate.** §5.6.
- **Crash harshness has no verdict.** Measured at 44% less energy in the
  2–6 kHz band, shorter tail, 2.4 dB off the peak. Whether it now sounds like a
  cymbal you want is not something a probe can say.
- **`probe_controls.js` on the whole rack is roughly an hour.** The TR-1000
  alone is ~40 minutes under the current four-notes-per-lane test. Run it in the
  background and name one machine when you can.

---

## 6. Things that have already been tried and were WRONG

Do not re-litigate these. Each was "fixed", then refuted by measurement.

- **The fill/`emptyLastBar` collision.** The proposed fix made the empty bar's
  hat *louder* (0.34 → 0.53). Reverted.
- **The swing "bug".** The shipped model is correct 8th-note swing. The
  "fix" was wrong. Reverted.
- **The Rhodes muffle.** `mdaEPiano.h` declares `f0`/`f1`/`ff` and `noteOn`
  computes them — but `processReplacing` **never reads them**. The muffle
  belongs to the sibling instrument (`mdaPiano.cpp` line 337). Porting it here
  filtered the Rhodes to −78 dB above 3.5 kHz. Vestigial fields in a source
  file are not features. Removing it returned 16.3 dB.
- **Linear FM in WebAudio gives phase deviation in RADIANS, not cycles.** The
  missing 2π cost 16 dB; fixing it gained the chip bass 22.6 dB at 1.5–3.5 kHz.
- **`const end = p + u32()`** reads `p` before `u32()` advances it. Split into
  two statements.
- **`pkill -f chrome-linux` kills your own shell** — the pattern matches your
  own command line.
- **A slide is not "the previous note in the array".** DKC's pedal strikes its
  root and its octave double on the SAME instant; taking the predecessor
  literally read that octave as a 12-semitone slide into a note it is actually a
  CHORD with. It was most of DKC's slides — mean slide distance 10.8 semitones,
  an octave siren on every downbeat. The predecessor must be at a strictly
  earlier grid position. There is a seam check named exactly that.
- **A long decay is a loudness change.** Energy goes as amplitude squared TIMES
  duration, so synthwave's 808 at 1.05 s decay tripled the low end without
  moving a peak level and failed 18 audio assertions. Decay, drive and gate are
  timbre controls; if one of them changes how loud the thing is, it needs
  makeup. That is now three times this file has learned it (drum bus, 303
  overdrive, 808 decay).
- **A measurement taken outside the instrument's working range measures the
  range, not the instrument.** Twice in one day, in two different shapes. First:
  the 303's ACCENT SWEEP knob read DEAD, and it was not — at the panel's default
  cutoff of 520 the envelope already opens the filter to 10.4 kHz, and 10.4 kHz
  against 11 kHz on an 82 Hz saw is the same filter in the mix. The knob had no
  room because the filter was open past audibility before it was touched; at
  cutoff 250 the same knob moves the top from 4,019 to 7,144 Hz. Second: a
  before/after render of the first 20 seconds reported that ACID — the genre
  named after the instrument — had not moved at all, because since the build
  work the 303 does not enter until 31 s. I measured the intro and called it the
  genre. **Anchor the window to the thing you are measuring**, then read it.
- **THE STUTTER WAS NOT THE NOTES, THE JAVASCRIPT, THE DOM SIZE OR THE
  ANIMATIONS.** 2026-08-05, the third stutter report and the third time the
  obvious theory was wrong. Four were refuted by measurement before the cause
  turned up: the densest genre (plastikman, 6068 events) was NOT among the slow
  ones; 86% of the main thread was native with no JS frame; jungle carries 19k
  DOM nodes at 21 ms while lofi carries 8k at 18; and disabling every CSS
  animation moved nothing. The cause was `knobEl` rewriting `val.textContent`
  for all ~169 knobs every frame whether the number had changed or not — a text
  change dirties layout, and the layout was expensive because the ROLL holds one
  element per note. **Neither the panels nor the roll was the cost on its own;
  hiding either fixed it.** `harness/probe_stutter.js` carries the whole route.
- **DRAINING THE EFFECTS ON STOP, THE OBVIOUS WAY, SILENCES THE PROGRAM.**
  `stopLive()` stops the sources and leaves the delay line ringing — the user
  hears it and is right. Ramping the sends, the feedback and every matrix
  crossing to zero on stop looks like the fix and is not: it leaves scheduled
  automation on those params, and `setSpace` restores them by assigning
  `.value`, **which an AudioParam ignores once it has an automation
  timeline**. The tail went to digital silence, which is what the probe was
  watching, and so did the music — −inf while PLAYING, on every cycle, and it
  never came back. Built, measured, reverted the same hour.
  **The lesson is the check, not the bug:** a probe that watches the tail
  after stop will call total silence a success. Whatever fixes this must be
  measured for sound WHILE PLAYING as well. `BACKLOG.md` §1 has the numbers.
- **And the obvious second fix measured nothing and was reverted.** The roll's
  playhead is moved by writing `left` as a percentage every frame — a layout
  property, the same shape of defect. Rewriting it as a compositor transform
  changed the frame time by nothing and left layout running at ~60/s either
  way. It looked right, it was not a fix, and it did not ship.
- **The echo tail was not accumulating.** The stutter the user heard was real
  and the theory was wrong: measured, the tail *decays*. So did "the main thread
  is stuttering" — p50 frame time 17 ms. The actual causes were a note landing
  before `t0` and never hearing the fader, and the gated-verb send sitting in
  FRONT of the channel fader. **Two wrong theories died to one measurement
  each**; do not start editing until you have the number.
- **Routing a voice INTO the chain's gate node does not move it post-fader.**
  First attempt at the gate fix did exactly that and put the raw output back in
  front of the fader. `gateTap()` returns **null** for a voice that has a
  channel, because the channel already feeds the gate from `mk`.
- **A "softener" that makes things louder is not a softener.** The 303's muffler
  measured **+2.0 dB**. Rebuilt on `chainCurve`, which has unity slope at the
  origin.
- **A more thorough test can be a blinder one.** Making `probe_controls`' short
  note accented — strictly more coverage — hid `tb303.decay` completely, because
  an accented 303 note takes `accDecay` and never reads `decay`.
- **Do not "fix" an audio threshold by raising it.** When the 808 failed the sub
  and air checks, the answer was not a bigger number — it was that the bar has
  to be the *machine's*, the same way the air floor was already the *rig's*,
  with both sides A/B measured on identical notes. Raising a global threshold to
  make a red line go green is how a battery stops protecting anything.

---

## 7. Operational constraints

- **Branch:** develop and push **only** on `claude/code-review-6jd9cz`.
- **Commits** must be authored `Claude <noreply@anthropic.com>` — a stop hook
  enforces this and will reject anything else.
- **No pull requests** unless the user explicitly asks for one.
- **Push** with exponential backoff on network failure (2s, 4s, 8s, 16s),
  `git push -u origin claude/code-review-6jd9cz`.
- **Never commit downloaded corpora.** `corpus/` content stays local.
- **Seed 1 is the test seed.**
- **The container has rolled this clone back three times in one session**, twice
  mid-task, to a commit several days old. Nothing was lost because everything
  was pushed. If `git log` shows a HEAD you do not recognise, that is what
  happened: `git fetch origin claude/code-review-6jd9cz && git reset --hard
  origin/claude/code-review-6jd9cz`, then check what you had uncommitted.
  **Commit and push early. Do not sit on work.** And do not trust a file you
  read before a long-running background job — read it again.

---

## 8. Where to look

| file | what it is |
|------|-----------|
| `Deckards Orchestrator MK2.html` | the program. Everything. |
| `Improv Machine playable_BETA 0.1.html` | **MK1.** Its synthwave synth and drums sounded good — worth reading before redoing either. |
| `docs/MASTERDOC-REBUILD.md` | the constitution |
| `docs/BACKLOG.md` | **everything outstanding, in one place, each item with why it is open and what would close it.** Written because intentions were being lost inside session entries in this file. Its §0 outranks every task in it |
| `docs/ROADMAP-MK2.md` | the schedule — the ORIGINAL milestone plan. The live list is `BACKLOG.md` |
| `docs/LICENSING.md` | what may and may not be vendored |
| `docs/SYNTH-RESEARCH.md` | CS-80, filter topologies |
| `docs/genre-research/*.md` | seven genres, **all unverified** — plus the units and the illusions: `fx-units.md`, `barberpole.md`, `stereo.md`, `matrix-mixer.md`, `plastikman-minimal.md`. **Every web search goes in here.** A finding argued only in a commit message is a finding that will be re-searched |
| `docs/UI_10X.md` | ⚠ **MK1** — its line numbers point at a frozen file. Marked, kept for the research only |
| `docs/CODE_REVIEW.md` | ⚠ **MK1** — reviews `conduct`/`improvise`/the ghost pass. History |
| `harness/README.md` | what every tool measures, and which are slow |
| `harness/mk2_roll.js` | the test that matters |
| `harness/mk2_test.js` | the seam checks — the note-level battery (118 at `af17de6`) |
| `harness/mk2_snapshot.js` | proof that a refactor is a refactor |
| `harness/mk2_ui.js` | the panels, driven in a real browser |
| `harness/probe_controls.js` | every knob on every machine reaches the sound |
| `harness/probe_matrix.js` | **every crossing of the grid moves air**, and the dub drop, measured |
| `harness/probe_render_determinism.js` | the same events rendered three times null out — the guard a feedback cycle broke |
| `harness/probe_wiring.js` | **which genre uses what was added.** Run it after adding anything |
| `harness/probe_kaoss.js` | the pad reaches live sound, and by how much, per genre |
| `harness/probe_theory.js` | the music laws, read off the notes — how a dissonance LEAVES |
| `harness/probe_arrival.js` | how a dissonance is REACHED — the approach column of the taxonomy, and the two readings of the appoggiatura kept apart |
| `harness/probe_voices.js` | every voice fires and none is silent |
| `harness/probe_novelty.js` | **is a lane a loop, noise, or generated?** the LZ76 instrument |
| `harness/probe_poly.js` | each drum lane's real period, reconstructed from the notes |
| `harness/probe_sax.js` | what the horn actually articulates |
| `harness/test_audio.py` | assertions on the rendered SAMPLES (needs numpy). 331 at `af17de6`, of which 15 fail — see the state table |
| `docs/genre-research/sax-playing.md` | how a saxophone is played, and what was built from it |
| `docs/genre-research/autechre.md` | Autechre and Plastikman: one root, and the space |
| `docs/genre-research/the-part-that-answers.md` | the reactive layer, and what it rejected |
| `docs/genre-research/the-arrival-of-a-dissonance.md` | the arrival law, its sources, the source conflict it had to decide, and the two seam checks that were wrong first |
| `docs/genre-research/the-second-keyboard.md` | why the pad shadowed the comp, the fix, and the honest gap between the material and the performance |
| `docs/genre-research/NOTES-FROM-THE-USER.md` | **the running log of what was measured, what was wrong, and why.** Read it with this file. |

---

## 8a. WHAT THE SESSION OF 2026-08-05 DID — a record, not a brief

*Builds `2026-08-05a` … `05d`, branch `claude/code-review-6jd9cz`. Written at
the user's instruction to record what was done and not what should be done
next. Every number here was measured; where a claim of mine turned out to be
wrong it is left in with the correction, because the retraction is the useful
half.*

### The law the user set, and what it cost to honour

> *"If I turn a knob it should always work for me no matter what the genre is.
> **The user is the end of the line.**"* — 2026-08-05

**Measured against it: fifteen genre/unit pairs failed.** A genre declares
which parts it sends to each effect, and a return unit no row feeds has no
input — so every knob on the flanger, the DP/4 and the barberpole was
inaudible on five genres each. Turn the pad on lofi: the cross moves, the
number changes, no sound.

I had written that up as *correct behaviour presented as a working control*
and proposed greying the panel out. The user rejected that outright. The
rule now: **a hand on any control of a return unit opens that unit's inputs**
on a song that was not already feeding it. Hand-only, reversible, and derived
from the grid rather than from a list of units.

  | | before | after |
  |---|---|---|
  | genre/unit pairs with no input | **15** | **0** |
  | the flanger pad's travel, lofi / dkc / bladerunner / acid | −81 / −99 / −92 / −100 dB | audible on all seven |
  | an **untouched** song, previous build vs this one | — | −81.6 dB worst, against a −82.1 dB same-build noise floor |

That last row is the load-bearing one: untouched songs are unchanged, proven
at the standard the renderer actually holds (it is not bit-exact — the room
sits at the float floor), by rendering the same build twice to establish the
noise and showing the change sits inside it.

`routeBaseFor` was hoisted out of `setSpace` to make this possible, and the
matrix panel's own hand-kept transcription of the routing rules — eleven lines
that had to agree with it and now cannot disagree — was deleted in favour of
calling it.

### Two defects in the bus scheduler

- **The barberpole was silent from 6.5 s into every playback**, on both genres
  that feed it, and had been. Its window rode each notch's Q; `setSpace` rode
  the window's two legs with one number so Q swung symmetrically about zero;
  Chrome installs all-zero filter coefficients at Q = 0. Re-researched rather
  than patched — DAFx-15 windows the notches' *cut gain* under a raised cosine
  over *log frequency*, and the panel had been drawing exactly that curve since
  the day it was written while the filters ran something else. Six `peaking`
  filters and a WaveShaper reading the bell off the sweep. −97.7 dB → −25.0 dB
  on synthwave; −95.4 → −23.3 on plastikman. `barberpole.md` §7.
- **0 of 1227 hard steps in the motion plan reached the mixer.** The bus grid
  was one point per beat, four times coarser than the plan's own sixteenth, so
  a `throw` placed at 0.8 of a bar was never sampled; and the "is this a step"
  test read the fader-law factor where its comment said "the lane's own
  depth", giving a flat 0.35 threshold against declared throws of 0.10–0.34.
  **1227 of 1227** now, 0 ms rise, on the line. plastikman's minute-long mute
  had been firing 57.7 ms early — exactly half a sixteenth, because the old
  bisection was finding `motionAt`'s rounding boundary and calling it the bar.
- And `rideBus` clamped three callers' bases in the wrong units. **One real
  casualty** (`barber.depth` written as exactly 1.000 all song on synthwave);
  the flanger and DP/4 cases cancelled algebraically and were unchanged to the
  last digit. **I claimed all three were broken in a pushed commit message and
  corrected it in the next one.**

### The TR-1000, tested as a rack

`harness/probe_rack.js` — five questions of one machine: is every knob drawn,
does every knob reach the sound, does a channel's knob stay on its own
channel, do the switches switch, and what does the program do with it while a
song plays. Four defects, none of which any existing check could see:

- the **808/909 switch** was declared, loaded from five genres, read by three
  voices, and **on no panel**;
- **switches carried no identifying key**, so no probe could find one on the
  glass — this probe still reported the switch missing after it was added;
- the **KIT control declared four positions for five kits** (the sampled
  Gretsch arrived later and nothing joined them up) — a seam check now holds
  every `pick` switch to the number of things it picks;
- and `V.brk` read `ev.slice` with no default, so a malformed event took the
  whole render down from that note on — how `dacHit` was lost once before.

**Automation, measured:** 71 of 76 controls ridden by at least one genre over
121 lanes; the 5 never ridden are exactly the 3 voicings and 2 switches, which
by contract must never move. No lane rides a switch. **Two p-locks were
written in the units of a different knob** — lofi's hat and dkc's kick set a
decay *multiplier* (neutral 1) with the numbers for a decay in *seconds*, so
the drum landed about 1% shorter on the locked steps. lofi proves the mistake
itself: four lines away it p-locks the seconds-based control with nearly
identical numbers, and there it is a 27–49% change.

**Twenty controls per drum machine were declared `bus` and are read at every
note.** Correcting the label turned two seam checks red — correctly: those
twenty had been passing "every knob reaches the sound" *only* by being
mislabelled into the bus list, two errors cancelling into a green tick. The
scanner now reads a built key (`grp + "Tune"`) as well as a written one.

### The pad bay

`harness/probe_pads.js`. Both pads drawn and wired to the controls they name;
a real pointer drag lands within 6% at all four corners and the centre on both
pads (the only test that catches an inverted axis); neither pad touches the
other's controls; HOLD does all three things the word implies.

### And a two-hour test made to take nine minutes

The user: *"Why is there a task running for over 2 hours right now? That needs
a better way to be done."* Measured rather than guessed: a render costs ~0.43 s
per second of audio and **does not degrade** (twenty identical renders: 484 ms
then 431 ms, so no leak). The cost was the file length — `probe_controls` was
rendering the whole kit, ~65 s of audio, twice per control, to test one drum's
knob. Scoped to the lane the panel says the knob lives on: **2 h → 8 m 46 s**,
and the answers improved, because the old full-kit comparison had been scoring
the bass drum's TUNE and PUNCH on the *snare's* window.

### Probe errors that nearly became findings

Kept because the pattern is the point — five of the seven measurements below
were wrong before they were right, and every one failed in the direction of
reporting a defect that was not there:

- `probe_rack` reported **all ten TR-1000 faders dead** — it passed no motion
  plan, so `setSpace` fell back to a different machine's controls;
- then **five channels leaking into each other** — decay tails running into
  the next drum's window. Fixed by rendering both firing orders: a tail cannot
  run backwards;
- `probe_pads` reported **both pads dead**, ten corners wrong — the pad bay
  sits ~5000 px down a page with a 720 px viewport, so every gesture landed on
  empty page and every control read its default;
- the pad audibility test reported the flanger **silent on synthwave at
  −59.3 dB** from a single mid-song excerpt; synthwave opens its flanger
  *through the chorus*, and three windows across the record read **−14.2 dB**;
- and a hand-written script reported the **ROOM unfed on five genres** by
  reading `space.feeds` and missing the two rows the grid opens by default —
  which is why `routeBaseFor` is now exported instead.

### `2026-08-05e` — the arrival rule, and a session that started on the wrong branch

**IT STARTED ON `main`.** The session was handed a clean checkout of `main` at
`b112dc9` — which is a snapshot taken 2026-08-03 and was, by then, 57 commits
behind this branch. Nothing looked wrong: the tree was clean, the battery would
have passed, and `docs/HANDOFF-MK2.md` §9 read as a coherent next job. It was
simply a week old. `git ls-remote --heads origin` is what found it, and
`START-HERE.md` now says to check the branch explicitly rather than only to
check for an unfamiliar HEAD. **A rollback that lands you on a real branch does
not look like a rollback.**

The work itself is §9.5 above and
`docs/genre-research/the-arrival-of-a-dissonance.md`. What belongs here rather
than there is the method, because three things went wrong and each is a rule
this file already has:

- **I guessed a number and wrote it into a code comment before measuring it**
  ("0.7%"). Measured, it was 7.4%. The comment now carries the real figure and
  the reason the guess was wrong, which turned out to be the interesting part:
  `intoBand`'s octave fold, not the draw.
- **The seam check was wrong twice**, and the second one is the one to
  remember. It compared bar-final arrivals against mid-bar ones, looked
  decisive at 20 seeds, and **passed with the law removed** at the 8 seeds it
  actually runs — the direction was sample noise. It was only caught because
  the guard was driven to failure, which this file has required since the stamp
  landed. *A guard that has not been watched to fail is not a guard*, and that
  now has a second scalp.
- **A hypothesis was tested and refused.** The performance's arrival numbers
  were worse than the law seemed to allow, and the obvious explanation was the
  arc thinner deleting resolutions the composer was obliged to write. Measured
  on stage 3's own material: the same rates. **The thinner is innocent** and
  the residue is the composer's own. Recorded because the un-measured version
  of that sentence would have been a plausible, wrong, expensive finding.

**And the rendered-audio battery reads 313/18, where `BACKLOG.md` said 15.**
The same 18 appear on `13fecdc` — rendered in a separate worktree, same seeds,
one number different in the whole list and that one is an excerpt whose notes
this build moved. So none of them is the arrival rule's. But the count grew
from 15 to 18 somewhere in `04a`…`05d` and **I have not attributed it to a
build; saying which would be a guess.** The backlog carries that as its own
row, with `04i` named as a suspect and not as a finding.

### Battery at `2026-08-05d`

seam 121/0 · ui 33/0 · blend 10/0 · midi 20/0 · voices 0 threw / 0 silent ·
snapshot IDENTICAL over 2100 seeds · renders repeatable on all seven (worst
−91.9 dB) · `probe_controls tr1000` 0 dead, 1 not judgeable · RULE ONE rolls
printed for all seven before and after every build in the session — **not one
note moved**, which is correct: all of it was stage 6.

---

## 9. THE NEXT JOB

*Rewritten 2026-08-04 at `f8ae533` (build `2026-08-04j`). The version this
replaces was written at `7c7644b` a week earlier and its items are folded into
§9.7 below rather than deleted — they were right then and most are still open.*

### 9.0 THE OPEN TASTE QUESTIONS — a list, NOT a gate

> **⚠ CORRECTED BY THE USER, 2026-08-04:** *"What is a taste check? You
> can't hear. I can always open the artifact and press play, there's nothing
> needed for that to be done."*
>
> This section had grown into a stop sign, and it cost real work: a fully
> researched, ready-to-build mechanism (jungle's bass, §9.4) was written up
> and deliberately NOT built, on the grounds that nothing should be built
> until the stack had been "heard". There is no sitting to wait for. The user
> opens the page and presses play, whenever they press play.
>
> **What §0 of the backlog actually means: do not stack unverified TASTE
> GUESSES on top of each other. It does not mean stop building what the
> research and the measurements already justify.** When the research is in the
> repo and the mechanism is buildable, WIRE THEM TOGETHER — that is the
> standing instruction, and asking permission instead is the documented
> mistake of this session.
>
> the backlog is the list of open taste questions, newest first. Every
> earlier build is inside the newest one, so playing the current artifact
> covers all of them at once. Nothing waits on it.

**Eight builds shipped on 2026-08-04. Nobody has heard any of them.**
`04b` the Wurlitzer, `04c` the record surface and the kick duck, `04d` chord
quality from 1170 jazz tunes, `04e` the bass leaving the root, `04f` the widened
out-of-key law, `04g` jungle's chords, `04h` the roll, `04i` the Rhodes lead,
`04j` the tune's rests.

**Start the playing from `04j`** — every earlier build is inside it, and the
published artifact IS `04j` (stamp checked). The brief is the backlog.
`docs/BACKLOG.md` §0 says it plainly and it has been true for weeks: *nothing
should be built on top of this stack until it has been played.* The sax is the
precedent — every metric green, and the owner refused it.

**Two of the eight are the loudest and should be judged first:**
`04i`, because lofi's tune changed instrument — sawtooth to electric piano — and
that is the biggest single change to this genre in weeks; and `04j`, because the
tune now stops between phrases, which is a change to the *shape* rather than the
sound.

### Before you start: orient. Run nothing.

**This block used to be five commands headed "the two-minute orientation", and
it is deleted. It is the line that caught the 2026-08-07 session** — it sits
2400 lines below the corrected testing rule, so a reader who obeys the top of
the file arrives here and obeys the bottom of it too. The first command in it
was the seam battery, on a program that had not been touched.

Orienting means **reading**, and it is free:

1. `docs/BACKLOG.md` §0 and §0b — what is open and why.
2. `git log --oneline -5` — where the branch is.
3. `node harness/mk2_stamp.js check` — is the published page this build. One
   second, and it is the one thing on pickup that can actually come back
   *false*.

The probes above are diagnostic instruments for questions. **Run one when you
have the question it answers** — `probe_density` when you are asking about
space, `probe_counterpoint` when you are asking what two lines do. Running them
to look busy produces five numbers that are already in this file.

Then open the published artifact and **look at THE ROLL**, at the top of the
page. It draws the performance through `midiKeyFor` — the same function the .mid
export uses — so it shows the file you would export. It is the fastest way to
see what a genre *is*: DKC's ostinato is two unbroken blue lines, jungle's is
almost nothing, lofi's comp is a green cloud with the tune above it.

**Read `docs/BACKLOG.md` before picking anything below.** This section names the
jobs; the backlog is the list that is kept current, and its §0 outranks both.

---

### 9.1 ✔ DECIDED at `2026-08-04k` — and the premise was half wrong

**The decision was made and is written down with its sources and its numbers:
`docs/genre-research/comp-register.md`.** In one paragraph: downward the walls
stand (the bass owns the bottom — the lowest voice owns the inversion — plus
the low interval limit); upward the band becomes the comp's HOME rather than
its wall, via a declared `registers.keysUp` reach that only an open voicing may
use; and the tune keeps its prominence by reservation and by taste, not by
acreage. lofi declares 12; six genres declare nothing and are byte-identical
(195/2100 snapshot lines moved, all lofi; re-baselined `bcd4e05a9f76a4f5`).

**What building it measured, and this corrects the paragraph that used to be
here:** the band's ceiling was NOT the binder. With the reach granted, the
generator offered zero candidates above the old ceiling (the fold puts every
tone in the band's bottom octave) — and once lifted shapes were offered, an
A/B against the prior commit showed open-material voicings had ALREADY reached
19.3 mean / 23 max under the old ceiling. **The real wall is interval
arithmetic: a four-voice chord's octave rearrangements cannot pass 23
semitones.** Three roads to "two octaves or more", each measured:

1. **Relocate the comp upward** (anchor at the granted room's centre): spans
   24+ in 24% of open voicings — and the comp's top sat above the tune in
   **49.8%** of co-sounding moments against 14.6% before, a tripling of the
   one relationship every comping source warns about. REFUSED as the default;
   it is the owner's dial if lofi wants the tall comp.
2. **Extension rate**: five-tone chords make 26-span voicings reachable under
   the tune. A harmony number, not a register one — parked until the
   04-stack is heard.
3. **The ensemble reading — recommended and true today**: every source's
   two-octave spread includes the ROOT, which this program's bass plays.
   Measured, bass + comp sounding together: **26.5 mean, p50 28, ≥24 in 73%
   of moments.** The sourced texture already exists across this program's two
   hands; the old 14.0 was measuring one hand of it.

What shipped beside the law: the octave-lifted candidate shapes, the LEFT
HAND'S OCTAVE (each shape offered with its lowest voice doubled an octave
below — the reference photo's own B3+B4 bottom), and a duplicate-pitch guard.
Net on lofi: sounding span 14.0 → 15.4, above-tune 14.6% → 17.1%, bottoms to
47, one more voice in some voicings. Modest by design — the loud options are
listed above with their numbers, for the owner to choose.

### 9.2 THE COMP NEVER BARKS — and it is an accident, not a choice

```
  which velocity layer of the Rhodes bank each note reaches, lofi, 60 seeds:
  the comp   soft 32.3%   mid 67.7%   hard 0.0%    (34 969 notes)
  the tune   soft  0.1%   mid 94.9%   hard 5.0%    (11 554 notes)
```

Zero of 34 969. The bank has three velocity layers and the part that plays three
quarters of the Rhodes notes reaches two of them. The bark is the instrument's
signature and it is a DYNAMIC — *"the player can bring out more or less bark with
more or less forte in their playing"* [corpus:chicagoelectricpiano].

**The cause is arithmetic.** The layer switches at velocity 80;
`vel = gain × 100 × (0.72 + 0.56 × bark)`; lofi declares `bark: 0.42` and its
comp gains top out at 0.79, so the hardest chord arrives at **75**. Five short,
every time, out of two numbers set independently of each other.

**This is a taste job, not a code job.** A comping left hand genuinely is played
softer than a melody. Render lofi seed 1 at `bark: 0.42` and at `bark: 0.60`
(which reaches the layer) and let the user choose. Do not raise it because the
measurement is tidy. `docs/genre-research/the-rhodes.md` §4a.

### 9.3 THE CHORDS DO NOT DRAG, AND THE SOURCES GIVE A NUMBER

The one hard figure in the lofi production research that is **not implemented**:

> "Quantized chords sound sterile… **nudge the entire chord 10–30 milliseconds
> late.** That drag creates the laid-back feel." [corpus:orphiq]

Stage 5 has a groove, a dilla lean and a per-lane push, and none of them is this.
**Before building it, answer the question the sheet flags:** [corpus:orphiq]
says "nudge the entire chord", but our comp is ROLLED — the voices already enter
across several sixteenths — so it is not obvious what "the entire chord" means
here. Decide it, write the reasoning down, then build.

And the finding beside it, which is more interesting and less safe: the layers of
a Dilla record **do not agree with each other** — hi-hat on a quintuplet feel
while the kick is on a triplet one, measured off waveforms
[corpus:pocketchops]. This program gives every lane one groove.
`lofi-comp-and-lead.md` §3, and note the stated limit there before quoting it.

### 9.4 ✔ DONE at `2026-08-04l` — jungle's bass plays a dub riff

**Researched and built in consecutive commits.** The cause: jungle wore
`bassStyle: "drone"`, which restrikes only on a chord change, under a harmony
that mostly does not — 99.8% of bars held one pitch. Now `bassStyle: "riff"`:
a cell drawn once and repeated across the declared two bars (dub's "two bar
motif"), with the POSITION deciding the POOL — anchor tones root/3rd/5th on
strong sixteenths, spice 2nd/4th/7th elsewhere, which is the sourced mechanism
rather than a weighting. Rests are rank-selected so they are the number the
table asked for. Slide comes through `acidize`, which already owns it for
every style. `docs/genre-research/jungle-bass.md`.

**MEASURED, matched A/B on `probe_counterpoint`, 20 seeds, jungle's row only:
parallel perfect keys/bass 19.2% → 0.8%** (chance floor 1.1), contrary motion
30.2% → 40.7%. Over 30 seeds: bars holding one pitch 99.8% → 14.4%, distinct
pitches a bar 1.00 → 2.35. Every other genre's row identical to the digit;
snapshot 300/300 jungle and no other genre. **This is the row §6.8 said the
chord side could not fix, answered from the bass side.**

**A MEASUREMENT LIED FIRST AND THE TELL WAS THAT IT WAS TOO CLEAN.** The A/B
read byte-identical on two builds the roll had plainly changed — impossible,
so the measurement was the suspect. `composeSong` is `(seed, RIG, genre)` and
**"jungle" is both a genre and a rig**, so `composeSong(s,"jungle")` composed
LOFI on the jungle rig. `makeChart` throws on the ambiguous form now, the same
answer `mk2_roll.js` already gives one argument over. Every count in
`bassRiff` remains `[CHOSEN]`; whether the riff should transpose with the chord
is undecided by the sources and follows the acid builder's precedent.

### 9.4a THE OLD ENTRY, kept for its reasoning — 100% root, one note a bar

`04g` gave jungle the jazz chords its own July sheet had asked for and never
received: dissonant intervals 0.0% → 13.5%, pitched moments 374 → 801.
**It did not fix the parallel fifths — 21.7% → 19.2%, still 150× Bach.** The
cause is the one this project already found and fixed for lofi: the bass is
100% root, one note a bar, so bass and chords move together at every change and
any interval between them survives.

**Do not guess it.** `jungle-harmony.md` §5: the sources give "roots, octaves,
fourths/fifths" and "pentatonic" and nothing more. The lofi fix worked because
`bass.md` researched it first. Do the same for jungle — or say the sources do
not support a change and leave the row open, which is also a result.

**RESEARCHED at `2026-08-04k` — `docs/genre-research/jungle-bass.md`. The
sources DO support a change and name its shape**: a two-bar dub RIFF on minor
pentatonic with root/3rd/5th anchors, real rests, slides — a repeating cell
(the ostinato's kin), not lofi's walking-tone table. The build is parked
behind §9.0's playing on purpose: it moves every jungle song and would land
on `04g`, which nobody has heard.

Acid, plastikman and synthwave's basses have never been researched either.

### 9.5 ✔ DONE at `2026-08-05e` — THE ARRIVAL RULE is written

**`docs/genre-research/the-arrival-of-a-dissonance.md`** has the four new
sources, the decision and every number. In one paragraph: of the eight figures
in the classical taxonomy, **seven are approached by step or by repetition and
exactly one — the appoggiatura — is approached by a leap**, on the condition
that it steps out. So: a note outside the chord sounding under it may be leapt
onto only when something follows closely enough to resolve it; otherwise the
leap narrows to a step. A **narrowing** in the tune (a scale step always
exists, so it can never be unsatisfiable) and a **cost** in the counter (whose
candidate list is three to five entries and could be emptied by a filter).

MEASURED: arrivals by leap **16.5% → 14.3%**, by step **67.7% → 70.0%**; on the
population the law governs, **9.5% → 4.8%**. 636 of 2100 seeds moved with form
and arrangement hashes identical on every one; baseline `c3abd9c25331528c`.

**Three things in that build are worth carrying forward as method:**

1. **A source conflict was decided, not averaged.** openmusictheory says an
   appoggiatura must resolve *opposite* its leap; musictheory.pugetsound says
   any direction, with a Mozart example. Took the loose reading — the step out
   is the law, the direction is a habit — because a habit dressed as a law only
   removes seeds, and because the strict source is the same publication as the
   table the whole argument rests on.
2. **Narrowing the MOVE was not enough and I had guessed it would be.** The
   residue was not drawn leaps: `intoBand` folds by whole octaves, so a
   one-step move can land eleven semitones away. The law is asked of the
   interval that actually sounds, and the answer there is to DROP.
3. **The seam check was wrong twice.** A threshold on the whole population
   cannot see a two-point effect; and a bar-final-vs-mid-bar comparison that
   looked decisive at 20 seeds **passed with the law removed** at the 8 seeds
   the check runs. What shipped is structural and was driven to failure both
   ways: 0.9% of 109 with the law, 9.7% of 113 without.

**STILL OPEN** (§7 of that sheet): the owner has judged none of it; the first note
of a phrase still has no arrival, because `hang` and the previous pitch both
reset at the phrase join; and the counter's `octaves: [-12, 12]` flip is the
larger arrival defect on that part and belongs to `BACKLOG.md` §6.5.

### 9.6 ONE THING THE ROLL CANNOT DO YET

- ~~**It shows one song and cannot compare two.**~~ **DONE `2026-08-04q`** —
  `--dump` / `--vs` and the on-screen ghost. It keys notes by bar and step and
  deliberately ignores wall-clock time, so a tempo change does not read as a
  thousand moved notes.
- **No zoom, no scroll.** A 304-bar jungle song is squeezed into the same width
  as a 44-bar lofi one, so a bar is three pixels and only the shape survives.

### 9.6a THE AUTOMATION AUDIT — what it found and what it left

*`2026-08-05a`, answering "test the automation and FX of each unit". Full
write-up in `BACKLOG.md` §6e; the barberpole's own research is
`barberpole.md` §7.*

**Fixed** (all three were in the scheduler or in one unit's construction, not
in any genre's table — which is exactly why every genre-level probe passed):
the barberpole's permanent silence; 1227 of 1227 hard steps that never
reached the mixer; `rideBus` reading three callers' bases in the wrong units.

**THE ONE DECISION LEFT ON THE TABLE — apex lanes deliver 40–88% of their
declared swing.** `motionAt`'s own comment says *"depth is the swing from arc
0 to arc 1"*, and `form.arc` never reaches 0, so every genre that declares an
apex lane moves less than it says it does: dkc 40%, lofi 50%, jungle 63%,
acid 67%, synthwave 71%, bladerunner 77%, plastikman 88%. Verified
independently. **It is a decision, not a bug** — either make the comment true
(document that depth is the swing across the arc's *actual* range) or
normalise the move so the declared swing is delivered. The second is the
honest one and it changes every genre with an apex lane, so it wants a
deliberate re-baseline, not a quiet edit.

**Five leads whose verifying agents never ran** are listed in `BACKLOG.md`
§6e and marked unverified. Two of the four LFO shapes reportedly used by
nobody is the cheapest to check and the most likely to be real.

### 9.7 STILL OPEN FROM THE PREVIOUS §9 (`7c7644b`), unchanged

- **The person playing it can add a note; it cannot MOVE one.** Research measured
  displacement at ~3× the groove effect of addition, and it is onset-conserving.
  `kit.answer` has `roll` and `figure: "run"`; Booth's sentence is *"a little
  roll **or skip**"* and the skip is missing. **Re-measure before building** —
  one judge measured a one-sixteenth nudge on a period-7 lane as audibly null,
  on a build that no longer exists. If it is null, say so and stop.
- **plastikman plays exactly ONE drum material** — 4432 bars on A, 3488 on Avar,
  128 on C, **zero on B**. Anything in its `kit.variants` is a comment with
  syntax. A seam check saying "every kit variant a genre declares is one it
  plays" would catch the class for all seven genres and will go red on
  plastikman immediately, which is correct.
- **Eleven of 210 composed parts are silent.** A machine loaded into a slot
  composes material that never reaches the performance in ~5% of songs. Believed
  to be the register allocator declining gracefully; **not verified.** Read the
  roll for one of the silent cases.
- **The pad adds no colour tones** — 0 of 4876 pad bars contain a 9th, 11th or
  13th, against the comp's 6.56%. May be correct for a block-chord pad and may be
  why it sounds flat. `[CHOSEN]`.
- **Samples, honestly.** "No distribution" answers the licence half; the blocker
  is payload. The HTML is 2.2 MB of which 1.07 MB is already base64 audio, and a
  33-semitone × 3-dynamic sax multisample is roughly **8 MB more** on a file that
  loads over mobile data. If it is worth it, **University of Iowa MIS** is the
  one to take — three genuine dynamic layers is what a model approximates least
  well. And note what the articulation work proved: a sampled sax with no
  phrasing model would have had the same defect with a more expensive waveform.

### 9.8 THINGS NOT TO DO

- **Do not report a red battery as "pre-existing".** Eight audio failures were
  dismissed that way for most of a session and two of them were real defects in
  the music.
- **Do not widen a threshold to make a check pass.** Measure why it moved.
- **Do not add a table entry to a variant without checking the variant plays.**
- **Do not trust a comment in the HTML.** They are claims. Several were true when
  written and became false.
- **Do not report a snapshot diff as "notes moved" without checking.** It hashes
  every field an event carries, on purpose. `04i` added `ev.timbre` and 1500 of
  2100 seeds "changed" while not one note did — proved by re-hashing with the
  field stripped. Do that before you re-baseline, and say which you did.
- **Do not measure space in bars.** `04j` made the tune rest and the obvious
  metric — bars with no note at all — read 5.3% → 6.2% and nearly got a real
  change reported as doing nothing. A rest in the back half of a bar leaves a
  note at the front. Space is measured in TIME.

## 10. What was deleted at `fcc3c50`, and why

The branch carried tools for a program that no longer exists. All of it was
**verified dead by exit code before removal** — not by reading, and not by
assuming:

- **Seven probes**: `probe_nct`, `probe_voiceleading`, `probe_hierarchy`,
  `probe_bass_consonance`, `probe_peak_arc`, `probe_ensemble`, `probe_grid`.
  Every one `require`s `run/engine_bundle.js` and calls `conduct` / `makeRng` —
  MK1's API. All exited 1. §5.5 recorded five of these; there were seven.
  **`harness/probe_theory.js` asks the same laws of MK2 directly** and is the
  replacement.
- **`harness/build_engine.py`** — it existed only to build that bundle. With the
  probes gone it had no consumer.
- **`tests/tests.js` and `tests/print_roll.js`** — MK1's suite and roll reader,
  both exit 1.

**Rewritten because they described MK1 as though it were current:**
`README.md` (the front door still told you to run `build_engine.py` and
`tests.js`, and described the ghost corrector as a feature) and
`harness/README.md`.

**Marked, not deleted**, because the research in them is still good even though
the plans are aimed at a dead program: `docs/UI_10X.md` and
`docs/CODE_REVIEW.md`. `Improv Machine playable_BETA 0.1.html` stays frozen as
reference. `corpus/` (456 KB of harvester scripts and derived tables) and
the backlog are live and were left alone.

**One near-miss worth keeping.** The first sweep classified probes by grepping
their output for "Error" and reported `probe_rule_of_three.js` as dead — because
one of its legitimate findings contains the word *cannot*. It exits 0 and works.
A crude detector nearly deleted a working tool, which is the same lesson §3
teaches about `probe_controls`: **suspect the measurement first.** Exit codes,
not string matching.

**THE ROOM BECAME A FEEDBACK DELAY NETWORK at `2026-08-03e`** — the user,
after being offered three matrix features: *"Seems like 3 is the important
one. Why would we do things on a flawed system? Make the foundation
correct first. That's a rule you should already be adhering to."* Correct,
and it is the same argument they made about form. What follows is the
foundation, not a feature.

**WHAT WAS ACTUALLY WRONG.** The renderer was not broken (repeatable and
guarded since `2026-08-03c`). The ROOM was thin: a ConvolverNode fed a
shaped noise burst, which meant no pre-delay at all (the research sheet
had asked for 40–80 ms and there was nowhere to put it), a decay baked
into a buffer so the room could not move during a song, and — the thing
that killed the matrix's feedback crossing — nothing could be routed back
into it.

**THE GATE THAT DECIDED IT WAS POSSIBLE.** AudioWorklet needs a module
URL, and this program is one file with no network. MEASURED, all four
combinations: a **Blob URL fails on `file://`** ("Unable to load a
worklet's module" — a file:// document's origin is opaque), a **data: URL
works on file:// AND on http(s)**. So the module is embedded as a base64
data: URL in `ROOM_FDN`. Second gate, also measured before building: an
FDN worklet in an OfflineAudioContext renders **bit-identical across
repeats (-316 dB)**, against the convolver's -92..-106 float floor. The
new foundation is MORE repeatable than the one it replaces.

**THE BUILD.** Eight delay lines of mutually-prime length, a pre-delay and
two allpass diffusers in front, one-pole damping per line, and an 8×8
Hadamard mix done as three butterfly passes (24 adds, not 64 multiplies)
scaled 1/√8. Stability is STRUCTURAL: "all unitary (and orthogonal)
matrices have unit-modulus eigenvalues... the resulting FDN will be
lossless", and Hadamard/Householder "ensure (critical) stability
regardless of the delays" [corpus:JOS PASP; Gerzon; Stautner-Puckette].
The per-line decay gain is the textbook one, `g = 10^(-3·D/(T60·sr))`.
**Nothing here was swept for.** Contrast the removed room→echo crossing,
whose ceiling I found by rendering tails until one stopped turning around
— that was a baked-in value discovered by experiment, and this is the
constraint that makes such experiments unnecessary. Principle 1, at the
level the mathematics allows.

**THE GENRE TABLES DID NOT CHANGE.** `irSec` → `t60` and `tailDark` →
`damp` keep their exact meanings. `tailPow` is the ONE re-interpretation
and it is flagged in the code: an FDN has no decay-envelope exponent
(the decay is the per-line gain, already carried by t60), so it maps to
SIZE, inverted and centred such that the old default 2.2 gives size 1.0 —
every genre that never touched it gets the room it was voiced against.
New optional `space.preDelay`, default 20 ms.

**MEASURED**: every genre's room now decays for the time it asks for, by
formula, untuned — lofi 1.4→1.30 s, synthwave 2.6→2.40, dkc 2.4→2.30,
bladerunner 5→4.80, acid 1.4→1.35, plastikman 4.6→4.50, jungle 2.2→2.00
(50 ms windows, measured from a peak that includes the initial diffusion,
so reading a little short is correct). The measurement itself used the
matrix as a tool: drums→room opened and the dry fader shut, which is the
drop being used as an instrument. Battery: 118 seam, snapshot IDENTICAL,
ui 26, voices clean, renders repeatable on all seven genres, audio 543/8
with the 8 being the same long-standing checks to the last digit.

**STILL OPEN, honestly.** (a) NO VERDICT ON IT YET — every genre's
room changed and no number here says it sounds better, only that it
behaves correctly; that judgement is the user's and nothing should be
built on top of this until it is made. (b) The convolver remains as a
FALLBACK for a browser with no AudioWorklet, so two rooms exist in the
file; `soundState().room` reports which one is running rather than leaving
it invisible. (c) The GATED reverb is still a second ConvolverNode, which
is why genres with a gate sit at the -100 dB float floor instead of
bit-exact. (d) The FDN's parameters are AudioParams and therefore RIDEABLE
— the room can now move across a song, and no genre does that yet. That is
the first thing worth trying, and it is what the room could never do
before.

**THE PROGRAM WAS MONO, AND STAGE ONE OF STEREO LANDED at `2026-08-03f`** —
the user: *"We need this all to be stereo. Most fx is needed to be in
stereo, the mellotron and wurly need stereo movement. Why are we not in
stereo?"*

**THE ANSWER, MEASURED FIRST: there was not one panner in the file.** No
StereoPannerNode, no PannerNode, no splitter or merger anywhere. Every
voice was mono and landed dead centre; the only stereo content in the
whole program leaked out of the ROOM's decorrelated halves. Side-vs-mid
energy, seed 11, before any change: acid **-58.5 dB**, jungle -48.8, lofi
-29.0, synthwave -23.5, dkc -20.4, bladerunner -14.3, plastikman -13.4 —
and the two "narrow" ones are only there because they are drenched in
reverb. Width was an accident, never a decision.

**RESEARCHED BEFORE BUILDING.** (a) The Rhodes Suitcase's "vibrato" IS AN
AUTO-PAN — "there is no pitch modulation, just amplitude modulation which
cancelled out in mono... when the Suitcase amps went stereo in 1969, this
pattern was translated into a panning effect" [corpus:rhodesmusic v-pan;
fenderrhodes.com/history/effects]. (b) The string-ensemble swirl is three
BBD lines driven by two THREE-PHASE LFOs 120° apart [corpus:jpcima
ensemble-chorus; Solina]. (c) MONO COMPATIBILITY is a hard constraint
here, not a nicety: out-of-phase content "can cancel... resulting in a
thin or hollow sound", "keep drums, bass and lead centered", "below
60-100 Hz should be mono" [corpus:sonible; waves; adsr] — and three of
these seven genres are sound-system music played on mono rigs.

**BUILT: `stereoOut(g, ev, t, m, role)`**, a shared stage a voice routes
through instead of naming a bus. Amplitude panning ONLY (a StereoPanner),
so summing to mono costs level and never costs the note — no Haas, no
phase tricks. Drums and bass are deliberately NOT panned. A machine with
no `pan` control declared does not even build the node, so every unpanned
voice renders exactly what it always did. `panHz`/`panDep` add the
Suitcase LFO, started at the NOTE's time so the sweep belongs to the
performance and not to when rendering began.

**WIRED SO FAR: rhodes, wurly, mellotron** — the two the user named plus
the one the research makes mandatory. lofi rides the Rhodes auto-pan
(sourced) and places the Wurly opposite it; bladerunner places and drifts
the mellotron. Battery 118/118, renders still repeatable on all seven
genres, snapshot IDENTICAL.

**⚠ STAGE ONE ONLY — THE PROGRAM IS STILL ESSENTIALLY MONO, and the
measurement says so:** after this change seed 11 moved from -29.0 to
-27.5 dB (lofi) and the other genres barely at all, because only three
machines have a pan stage and only when a song happens to draw them. DO
NOT read the entry above as "stereo is done". What remains, in order:
(1) the other ~15 voices need routing through `stereoOut` — it is one
line each at their `connect(g.bus.…)`; (2) the ENSEMBLE swirl (three
delay lines, two 120°-phase LFOs) for cs80/vp330/mellotron, which is
where real width comes from and which no amount of panning substitutes
for; (3) the ECHO is still a mono delay line and a dub echo is classically
stereo (ping-pong); (4) the DRUM machines' per-voice pan, which is how a
kit stops being a point source. And the owner has judged none of it.

**STEREO, ALL OF IT, at `2026-08-03g`** — the user: *"I don't understand,
I said I want stereo... Do all of them now."* All four remaining items
from the `2026-08-03f` list landed in one pass:

1. **Every melodic voice routes through `stereoOut`**: cs80, lead, vp330,
   waveseq, sax, wash joined rhodes/wurly/mellotron. `panControls()` /
   `panGroup()` are shared declarations (like chainControls); five more
   machines carry PAN/RATE/DEPTH with a STEREO group on their panels.
   Genres ride them where hosted: bladerunner (cs80 drift + vp330
   placement), dkc (waveseq), plastikman (wash). The "lead" VOICE has no
   INSTRUMENTS machine, so V.lead stays centred — which is also the RULE
   ("keep... lead vocals centered"). Basses and the tape bed: centred on
   purpose. The seam battery caught params-vs-motion misplacement TWICE
   during this work (lanes landing in `params.vp330` — params comes first
   in the file); its static scanner was also taught that a P() call with a
   VARIABLE machine name reads that control on every machine declaring it.
2. **THE ENSEMBLES WERE ALREADY THREE-LINE CHORUSES AND WERE SUMMED TO
   MONO ONE LINE LATER.** vp330: three taps, two three-phase LFOs — the
   Solina architecture, collapsed into one node. Now L/C/R (±0.8). cs80:
   two modulated taps, now ±0.7 either side of the centred dry. This is
   where record-width comes from; the mono sum recovers the identical
   mono chorus (amplitude only).
3. **THE ECHO PING-PONGS, mono-safely**: `echo.width` (new dial, kaoss FX
   group, def 0 = the old wire) scales a SQUARE LFO at period 2×delayTime
   driving a panner on the echo return — repeat N left, N+1 right. Summed
   to mono the square cancels out of the arithmetic entirely. Offline the
   LFO starts at context zero (Law 7 holds — probe green); live, phase
   depends on when play was pressed, as on hardware. Bases: jungle 0.55,
   plastikman 0.40, lofi 0.22 [CHOSEN].
4. **THE KIT HAS AN IMAGE**: per-chain StereoPanner (mk → pan →
   kitFilter), positions from the genre's `space.kitPan` table (letter →
   -1..1, absent = 0 = the old wire; no knob, no ride demand — a
   declaration like `feeds` was). Kick/snare centred everywhere per the
   mono rule; hats/rim/clap/cymbals straddle at ±0.14–0.36. Declared for
   lofi, plastikman, jungle, acid, synthwave, dkc. Chain SENDS tap before
   the panner (pre-fader again): an echoed hat throws into the ping-pong,
   not a panned send.

MEASURED (side-vs-mid, seed-11 excerpts — a blunt metric that
underweights image because centred kick/bass dominate energy): acid
-58.4→-44.5, jungle -48.8→-35.4, synthwave -23.5→-18.0, plastikman
-13.4→-12.9, bladerunner -14.3, lofi -26.8, dkc -20.4. Battery: 118 seam,
snapshot IDENTICAL, ui 26, blend 10, renders repeatable on all seven.
STILL OPEN: the owner has judged none of it; per-genre widths/positions are
all [CHOSEN] first guesses; dkc/lofi read low because seed 11's draws — a
roll across seeds would say more; the mellotron's own ensemble (it is a
tape machine, no chorus — correct) and the segakit's chains carry no
kitPan for bladerunner (barely a kit).

**THE FIELD at `2026-08-03h`** — the user: *"Why wouldn't we have a
dynamic stereo rack that adapts to what has been loaded and then can be
automated by the program? ... we should use some interesting visual UI ...
novel and exciting retro futuristic."* All three, in one panel.

**WHY IT WAS RIGHT.** Stereo had landed as PAN/RATE/DEPTH knob triples on
eight separate machine panels. Every knob worked; you could not SEE the
image, only read numbers off boxes in different parts of the rack — the
same defect the matrix panel had when it was three labelled clusters
instead of a grid. A stereo display's layout IS its information.

**WHAT IT IS.** `INSTRUMENTS.field` — a fixed machine that DECLARES NO
CONTROLS and adds nothing to the sound. Every blip drives
`<machine>.pan` and `matrix.<bus>Room`, which already exist, are already
ridden by genres, and are already drawn as knobs elsewhere. Same rule as
the KAOSS pad: "nothing new is owned". X = pan, Y = how far into the room
— a stage seen from above, and both axes are real automatable controls.

**IT ADAPTS BECAUSE ITS ROWS ARE NOT A LIST**: `fieldRows()` reads the
chart's picks through `machineIn()` for the five SOURCE slots. Change rig,
genre or a mute and the stage repopulates. Two corrections were needed
while building: the first version drew only pannable machines (a band with
no floor, and it hid the DECISION that drums/bass are centred), and the
second swept in the fixed machines so the echo, the desk, the matrix and
the display ITSELF appeared as players — a processor has no position
because everything passes through it. Now: sources only; pannable ones are
rings, centred-by-design ones are BARS that still move in Y and carry the
mono rule in their tooltip.

**THE LOOK** is the one panel here with no real-world twin, so it is a
phosphor tube — amber, curved, scanlined, graticule etched on the glass,
slow sweep. Broadcast goniometer and radar PPI as ancestors. Retro-futurism
as the honest idiom rather than a costume: 1979's idea of a mixing display,
which is the shelf the rest of this rack sits on.

**THE FX RACKS the user asked for are PRESETS, and they are hand
positions**: AS WRITTEN (delete every stereo TRIM — back to the genre),
WIDE SCREEN, DUB PLATE (alternate sides + echo ping-pong up), MONO CHECK
(flatten the image and kill the width — what a club rig hears). They write
TRIM and only TRIM, so the genre underneath is untouched. This is exactly
the round-two research finding built: "storing patch variations for
performance verse/chorus structures" [corpus:soundonsound, Erica].

Battery 118/118, ui 26, snapshot IDENTICAL. STILL OPEN: the owner has heard
none of it; blips carry a ghost for the live automation and a trail for
auto-pan depth, both untested by eye in motion; presets are first guesses
[CHOSEN]; and a genre cannot yet declare a whole field state per SECTION,
which is the obvious next step now that a state is a thing you can see.

**THE CONDUCTOR ARRANGES THE STAGE at `2026-08-03i`** — the step the field
made obvious: a genre can now declare a whole FIELD STATE PER SECTION,
`GENRE.x.stage`, instead of moving one instrument's pan at a time.

**IT IS NOT A SECOND MECHANISM.** `makeMotion` expands a stage into ordinary
`kind:"section"` specs on controls that already exist, then the normal lane
loop handles them — one owner, one code path, the way `chainControls()` is
a shorthand for a coherent set of knobs.

**IT IS CONSTRAINTS, NOT POSITIONS.** A stage never names where an
instrument goes. It names how WIDE the picture is and how DEEP, as RANGES,
per section function. Seating is drawn per song from named streams: two or
more players are spread evenly across the width (so they never share a
spot) and each seat is jittered. **And it seats the machines THIS CHART
ACTUALLY PICKED**, read through `machineIn()` exactly as the field display
reads them — a rig that draws three keyboards gets three seats.

**WHAT IT DOES NOT OWN**: a machine's own character. The Rhodes' auto-pan
(`panHz`/`panDep`) is the instrument, not the arrangement, and stays
declared on the machine. The stage places players; it does not tell them
how to play. lofi's hand-written pan POSITION lanes were removed in favour
of its stage; its Suitcase sweep stayed.

**THREE THINGS WENT WRONG AND ALL THREE ARE RECORDED IN THE CODE:**
1. `put()` originally THREW on a collision between a stage and a
   hand-written lane. Right for one genre, fatal here: BLENDING merges two
   tables, so any blend of a staged genre with a laned one collides by
   construction — it killed 38 of 504 pairs. Now a stated PRECEDENCE: the
   specific lane wins, the stage does not seat that control. Still exactly
   one writer, decided by rule rather than by order.
2. A lone player was seated at dead centre, which made the stage INERT on
   every song drawing a single keyboard — measured, lofi's widest chorus
   moved the Wurly 0.07. A solo player stands *somewhere*; the side is now
   drawn per song. Two-plus still seat evenly.
3. `mk2_test`'s gesture-ridden check sampled ONE seed for movement while
   sampling TWELVE for hosting. That asymmetry was a latent bug: a lane
   that exists only when a machine is DRAWN reads as idle whenever seed 1's
   draw went the other way (`rhodes.pan`). Both halves now use the same
   twelve seeds — what the check always meant.

**DECLARED ON TWO GENRES**: lofi (the gentlest stage in the file — a beat
tape does not swing its players; opens a little for the chorus, closes for
the outro) and synthwave (the demonstrator: it hosts the CS-80 and the
string machine at once, narrow through the verse, thrown open on the
chorus, room deepening as it opens). MEASURED on synthwave: seed 1 seats
the CS-80 right and reaches +0.20 in the chorus; seed 4 seats it left at
-0.22 — same genre, different stage every song.

Battery 118/118, blends 10/10 (504 pairs), ui 26, snapshot IDENTICAL,
renders repeatable on all seven. STILL OPEN: the owner has judged none of it;
sections a stage does not name snap to centre rather than holding (that is
`kind:"section"`'s own semantics everywhere, so it is consistent rather
than special, but it is a choice worth hearing); five genres have no stage;
and the field display does not yet NAME the section's stage on the tube,
which is the obvious next bit of polish.

**THE FX SUITE GREW at `2026-08-03j`** — the user, after the Plastikman
research listed Hawtin's five units against our two: *"I want to clone the
fx racks Hawtin had that you named!"* First unit, chosen because it is the
one we had NO equivalent of: the **Yamaha SPX90 flanger**, kept on
*Consumed* for its "dirty, great flange" [corpus:soundonsound Classic
Tracks].

**BUILT**: `INSTRUMENTS.flange` — two modulated delay lines a quarter cycle
apart, panned opposite, each with its own feedback, into a fixed 12 kHz
band limit. Four ridden controls (rate/depth/fb/mix) and an XY pad on
rate × depth.

**WHAT IS SOURCED AND WHAT IS NOT, kept separate in the code.** The
topology is the standard flanger every unit has ever had. The one
documented characterful number is the band limit: the SPX90 converts at
31.25 kHz and its processed signal runs 20 Hz–12 kHz [vintagedigital;
manualslib specs]. **That ceiling is fixed and is NOT a control** — it is
no more adjustable on the real box than here, and a knob no genre rides is
against this file's standing rule. Every other range is mine and marked
[CHOSEN]. (It was first declared as a `switch` control and the battery
correctly refused it: `kind:"switch"` is never automated and never read per
song, so it reached the sound through nothing the checks could see. The
right answer was to delete the knob, not to exempt it.)

**THE GRID GREW A COLUMN**, which is the recommendation round four ended
on — grow by adding EFFECTS, not holes. `MATRIX.outs` now has FLANGE (D)
and `MATRIX.ins` a `flange` return, so the grid is 7 × 4. **A NEW RULE
KEEPS IT ACYCLIC AS IT GROWS**, written into `MATRIX.none`: *an effect
return may feed the MIX and nothing else.* `flangeEcho`, `flangeRoom` and
`flangeFlange` are blind plates carrying that reason. The echo's two
exceptions predate the grid and are inside one unit (its FDBK and WASH),
not between two. So no future column can re-introduce the cycle that cost
the renderer its repeatability — and the flanger's own feedback lives
inside the unit, which is where a hardware flanger keeps it too.

**GENRES**: plastikman feeds drums/bass/keys into it and rides the unit
plus five crossings (the record it came from — "an album of feedback...
everything was cross-modulating everything else"); synthwave flanges its
lead and its echo return.

MEASURED (probe_matrix, plastikman): drumsFlange -10.3 dB, keysFlange
-6.4, bassFlange -14.7, echoFlange -11.2, roomFlange -8.6, flangeMix -4.0.
Battery 118/118, snapshot IDENTICAL, blends 10/10, ui 26, renders
repeatable on all seven.

**A PROBE BUG THE COLUMN EXPOSED**: probe_matrix identified a crossing's
bus with a hardcoded `/(Mix|Echo|Room)$/`, so every `*Flange` crossing
reported its bus as unknown and `leadFlange` was called a dead knob when
the lead simply was not playing. It now derives the column suffixes from
the declaration — the same lesson as the seam scanner and the role tags:
**anything that lists what the program contains will go stale; derive it.**

**STILL OPEN — the other four units.** Ensoniq DP/4 (a four-way PARALLEL
processor — architecturally the most interesting, and the strongest
argument for more columns), Lexicon PCM90 (our FDN room is the same job
done differently; what a PCM90 adds is ALGORITHMS, not quality), Roland
SRV-330 "Dimensional Space", ART Multiverb gated reverb (we already have a
gated verb, unresearched against it). And the owner has judged none of it.

**THE DP/4 at `2026-08-03k`** — second of Hawtin's units, and the one that
is architecturally interesting rather than merely missing.

**THE INSIGHT THAT SHAPED IT**: the Ensoniq DP/4 (1992) is "four
independent effects processors, four independent inputs and outputs", 46
algorithms, and **"a digital patch bay that allows you to route signals in
either mono or stereo, in series or parallel"** [corpus:vintagedigital;
barryrudolph]. **The DP/4 is a matrix with effects inside it** — and half
of it was already built here, because our grid IS that patch bay.

**WHICH CONFIGURATION, and it is one the box has**: the DP/4 runs 4-source,
2-source, or **"1 Source Config using a single signal processed with one
4-UNIT preset"**. This is the 1-source configuration — one matrix column
feeds the box, four units work in parallel, each with its own amount and
return, summed to one return row. The 4-source version would be four more
columns and thirty-two more crossings, and a crossing no genre rides is a
knob that does nothing.

**THE FOUR ALGORITHMS were chosen for what this program CANNOT already
do** (it has a reverb, a delay and a flanger, so none of those repeat):
PHASE (four swept allpass stages — notches where a flanger is a comb),
DRIVE (asymmetric saturation as a SEND, so one part can be dirtied without
pushing the bus), ROTARY (a Leslie: level and pitch sweeping together,
opposite across the pair), CRUSH (rate reduction; the comment says plainly
it is a gated chop and not a true sample-and-hold). Every unit builds all
four and the switch CONNECTS the chosen one — buildGraph runs once per
context by law, so a switch cannot rebuild the graph.

**THE BLIND RULE IS NOW GENERATED, and this is the better correction.**
The flanger build stated it as "a return may feed the MIX and nothing
else" — and I had already broken it in the same commit, because synthwave
usefully flanges its ECHO return, which is perfectly acyclic. A rule you
violate while writing it is the wrong rule. It is now an ORDER —
`MATRIX.order = ["echo","room","flange","dp4"]` — and signal may only flow
FORWARD along it, plus into the mix. `MATRIX.none` is FILLED FROM that
list at load, with each reason generated, so a new effect cannot forget to
close its own back-doors. The two exceptions stay in `MATRIX.alias`
because both are inside one unit, not between two.

**plastikman** feeds drums and keys into it, sets the four units to
phase/drive/rotary/crush, and rides all eight amount/level controls plus
all eight DP4 crossings — the record the box came from. MEASURED
(probe_matrix): drumsDP4 -21.7 dB, keysDP4 -22.1, bassDP4 -25.2, echoDP4
-26.7, roomDP4 -19.2, flangeDP4 -12.3.

Battery 118/118, snapshot IDENTICAL, blends 10/10, ui 26, renders
repeatable on all seven.

**THE SAME BUG, A THIRD TIME, and it is now dead.** probe_matrix worked
out a crossing's bus by stripping a hardcoded `/(Mix|Echo|Room)$/`; that
went stale at FLANGE; the fix pulled column names with `/[A-Z][a-z]+/`,
and THAT went stale at DP4 because "DP4" contains a digit. It now derives
the ROW names instead — every source has a `<row>Mix` crossing, so the
rows are the Mix keys with "Mix" removed, longest match wins. Nothing to
keep in step whatever a column is called next. **Anything that lists what
the program contains will go stale; derive it.**

STILL OPEN: three of Hawtin's five (Lexicon PCM90 — our FDN room is the
same job, what a PCM90 adds is ALGORITHMS; Roland SRV-330 "Dimensional
Space"; ART Multiverb gated reverb, unresearched against our existing
gate). The `snap` motion kind from plastikman-minimal.md is still the
highest-value unbuilt thing. And the owner has judged none of it.

**SNAP, AND THE PROGRAMME TAPE, at `2026-08-03l`** — the highest-value
unbuilt thing from plastikman-minimal.md, now built.

**THE GAP IT CLOSES.** Every motion kind in this file INTERPOLATES:
`section` steps ramp, `lfo`/`arc`/`gesture` are continuous, `throw` decays.
So the most famous move in minimal techno was structurally impossible here:

> "I'd let all the effects play, and then in one set INSTANTLY turn off the
> effects, and then EIGHT BARS LATER turn them back on." — Hawtin on
> *Consumed*, via the desk's MIDI mute automation
> [corpus:soundonsound Classic Tracks]

**`kind: "snap"`** is a rectangle: at bar B it jumps, holds `bars`, and
jumps back, with no ramp at either edge — because the edge IS the gesture.
A fader ridden down over two beats is a fade; this is a mute. Windows are
computed in BARS, so a cut lands on a bar line by construction and reads as
a decision rather than an accident. WHERE the cuts fall is arithmetic
(every N bars, never the first — a record does not open on a hole); HOW FAR
it jumps is drawn once per song, so one hand makes one decision and repeats
it.

**plastikman cuts all four effect returns** (echoMix, roomMix, flangeMix,
dp4Mix) for 8 bars every 32. MEASURED on seed 11: `................................XXXXXXXX........................XXXXXXXX`
— and the dry band keeps playing throughout, which is the entire point:
"the space between the sounds and beats defines the music that it's
surrounding."

**THE PROGRAMME TAPE** is the UI, and it exists because a snap is the one
control in this program that is a SHAPE IN TIME rather than a position — a
knob cannot draw it and a curve cannot either. So: punched paper tape,
which is the right ancestor rather than a costume, because mute automation
on a 1970s desk *was* a program on a strip, and a punched tape is the only
display where "nothing here for eight bars" is a physical hole you can see
coming. Sprocket track, cuts punched through to the dark of the machine
with their length screened on them, an orange playhead, and a CUT lamp that
lights while the effects are gone. Like the field it declares no controls
and reads the motion plan, so it shows what WILL happen; a genre with no
snap gets an honest empty strip that says so.

Battery 118/118, snapshot IDENTICAL, blends 10/10, ui 26, renders
repeatable on all seven.

STILL OPEN: only plastikman snaps — jungle's drops and synthwave's
prechorus are the obvious next candidates, and both are sourced genres
where a hard cut is idiomatic. Three of Hawtin's five units remain
(PCM90, SRV-330, ART Multiverb). And the owner has judged none of it.

**⚠ THE ROOM WAS SILENTLY FALLING BACK TO THE CONVOLVER — found at
`2026-08-03m`, and this is the important part of this entry.**

Building the PCM90's parameters, `spread` measured **-92 dB** — inaudible,
when an allpass coefficient swung 0 → 0.9 should be unmistakable. So did
`random`. The cause: `addRoomModule` built its data: URL with
**`btoa(ROOM_FDN)`, and btoa throws on any character above U+00FF.** The
worklet source is a commented block of code inside a file whose house style
draws rules with U+2500 (`─`). The first time a comment inside ROOM_FDN
used one — a comment *I* added in this session — addModule threw, the catch
swallowed it, `fdnReady` came back false, and **every render quietly used
the ConvolverNode instead of the FDN.** Every room parameter then did
nothing at all.

**FIXED STRUCTURALLY**, not by deleting the character:
`encodeURIComponent` has no Latin-1 limit, so an ordinary comment can never
re-arm the trap. **Anyone touching ROOM_FDN should know this was possible
and is now not.**

How long was it broken? Only within this session's last commit — the
character was introduced with the PCM90 comment block. `2026-08-03e`
through `l` were fine. But note what hid it: `probe_render_determinism`
still passed (a convolver is repeatable), the RT60 probe still passed (a
convolver's IR length IS its decay), and the battery went 118/118. **No
existing check could tell which room was running.** `soundState().room`
reports it for the LIVE graph only; there is no equivalent for a render,
and that gap is still open.

**THE PCM90 ITSELF, honestly split.**
- **SPREAD lands.** "The Size, Spread and Shape controls allow adjustment of
  the buildup and decay of the initial part of the reverberation envelope"
  [corpus:lexiconpro; recordproduction PCM90] — here the diffusers'
  coefficient. Measured **-4.3 dB** of real change; plastikman 0.72,
  bladerunner 0.78.
- **RANDOM HALL DOES NOT, AND SHIPS OFF.** Lexicon's claim is that the
  reverberators "change over time in controlled, random ways to avoid the
  buildup of tinny, grainy, metallic colorations". The wander is built,
  seeded (Law 7 holds), and slower than its own smoother after a first
  attempt drew targets 6× too fast and averaged to nothing. But the metric
  written for it — peak-to-median of a **time-averaged** tail spectrum,
  which is the only thing that distinguishes a smeared comb from a moved
  one — says it makes ringing **WORSE: 25.3 → 31.3 dB**. Diagnosis on
  record: the per-line decay gain is computed for the NOMINAL length, so a
  wandering tap detunes the decay balance and turns a line into a
  resonance. An attempt to recompute the gain from the actual delay changed
  the measurement by exactly nothing, which means that edit did not take
  and the diagnosis is unverified.
  **`space.random` defaults to 0 on every genre. That is a verdict, not a
  default** — the sax precedent: a claim the measurement refuses does not
  ship. Whoever picks it up needs either a better implementation or a
  better metric, and should distrust the one above until it disagrees with
  a fixed network in the direction Lexicon promises.

Battery 118/118, snapshot IDENTICAL, ui 26, renders repeatable on all
seven — with the FDN genuinely running again.

**THE RESEARCH GETS ITS OWN SHELF, AND A NEW PROBE ASKS WHO USES WHAT —
`2026-08-03n`.** The user: *"Your web searches need to be their own research
docs for future reference. Are we making sure to connect things up properly
and understanding how to use what we are adding?"* Two questions; the second
was answered by measuring rather than by claiming, and the answer was NO in
two specific places.

**1. THE DOCS.** Searches behind the flanger, the DP/4, the PCM90 and the
whole stereo build had been argued in commit messages and handoff entries —
which is where findings go to be forgotten. Now:
- `docs/genre-research/fx-units.md` — every unit of Hawtin's rack, one
  section each, with what each source DOES and DOES NOT give. The two
  unresearched units (Roland SRV-330, ART Multiverb) are in there as
  explicitly unresearched, with a warning not to build from the guess
  written next to them.
- `docs/genre-research/stereo.md` — the Rhodes auto-pan, the Solina's
  three-line/two-three-phase-LFO swirl, and the mono-compatibility rules,
  with the before/after side-vs-mid table.

**2. `harness/probe_wiring.js`, NEW, and it found real gaps.** Everything
added recently was measured ALONE at the moment it landed; nothing ever
asked, per genre, WHICH capabilities are actually reached. The battery
cannot catch this — it only asks whether SOME genre uses each control.

    genre        flange  dp4  pan  kitPan  width  spread  preDly  cuts
    lofi           -      -   yes   yes     yes     -       -      -
    synthwave      -      -   yes   yes      -      -       -      -
    dkc            -      -   yes   yes      -      -       -      -
    bladerunner    -      -   yes    -       -     yes     yes     -
    acid           -      -    -    yes      -      -       -      -
    plastikman    yes    yes  yes   yes     yes    yes     yes    yes
    jungle         -      -    -    yes     yes     -       -      -

**FOUND AND FIXED**: `preDelay` was declared by **NOBODY**. It was built at
`2026-08-03e` because the reconstruction sheet had asked for 40–80 ms and
the convolver had nowhere to put it — and then never connected to a genre,
for two builds. That is the file's cardinal sin with a bigger coat on.
bladerunner now takes 62 ms (inside the sheet's band: a late room reads as
a BIG room, which is that cue) and plastikman 34 ms.

**FOUND AND LEFT OPEN, honestly**: flange, dp4 and cuts are **one genre
each** (plastikman). acid and jungle have **no pan at all** — their draws
land on machines with no pan control. Neither is a bug; both are thin. The
sourced candidates are named in the earlier entries: jungle's drops and
synthwave's prechorus for `snap`, and a genre-by-genre pass on the FX
columns. **Run `probe_wiring` after adding anything: a capability one genre
uses is a capability that has not been understood yet.**

**A PHASER THAT CLIMBS FOREVER, AND A BACKLOG OF EVERYTHING OUTSTANDING —
`2026-08-03o`.** The user: *"Before we do that lets build a doc that
collects everything we are saying needs to be done or should be done. Then
lets build a barberpole phaser will need an interesting retro futurism ui
also. Makes sure you do your research."*

**1. `docs/BACKLOG.md`.** Everything this project has said needs doing,
collected out of the session entries where intentions go to be lost. Six
sections, each item saying WHY it is open and WHAT would close it. **§0
outranks the rest and is not a task**: the FDN room, the whole stereo build,
the matrix, the field, the stage, the flanger, the DP/4, the snap and now
the barberpole have all been MEASURED and none of them JUDGED. The
sax is the precedent — every metric green, the owner refused it.

**2. THE BARBERPOLE.** `docs/genre-research/barberpole.md` is the research,
written before the build and kept after it, with a table of what the sources
gave against what we did — including three things they describe that we did
NOT build, each with its reason.

- **It is Bode's**, and the panel says so. He made the effect from
  comb-filter peaks in **1981**, and it was **his last completed
  instrument**; Synth-Werk and ZKM are reconstructing it now from his
  archive [perfectcircuit, synthtopia].
- **Method 1 of three**, from Esqueda/Välimäki/Parker, DAFx-15: "a series of
  several cascaded notch filters moving in frequency **one octave apart from
  each other**". Chosen because it is EXACT here and the others are not: a
  `BiquadFilter`'s `detune` is in **cents**, so one sawtooth running 0→1200
  into every notch sweeps them all up exactly an octave, exponentially, and
  at the wrap each notch lands precisely where its neighbour began. Seamless
  by arithmetic rather than by tuning. Six notches at `110 * 2^i` — above the
  four a builder calls the minimum, inside Sinevibes Whirl's 4–8.
- **The envelope is half the illusion and is the part that is easy to skip.**
  Shepard's components sit under "a fixed bell-shaped spectral envelope over
  the LOGARITHMIC frequency axis"; DAFx-15 rides its notch gains with a
  raised cosine. Here the bell rides each notch's **Q**: no depth at the
  bottom of the range, deepest in the middle, none again at the top, offset
  per notch. Without it the bottom notch jumps an octave once a cycle and
  the illusion is just a sweep with a click in it. Built as a sine plus a
  shared `ConstantSource` lift, because an `AudioParam` SUMS its inputs.
- **Direction is a `switch`, not a dial** — a pole that changes direction
  mid-sweep is two effects — and it is in the PER_SONG list, so the battery
  can see it is actually read.
- **Column F of the grid**, wired from `MATRIX` like every other column, with
  a `barber` return row. synthwave feeds it lead+keys, plastikman feeds it
  keys. `probe_matrix` on synthwave: `barberMix -33.7 dB`, `leadBarber
  -45.2`, `roomBarber -36.1`, `flangeBarber -50.4` — the column moves air.
- **The UI** (`sk-pole`): a chrome-capped glass cylinder whose stripes climb
  at `1/rate` and reverse with DIR, with six notch markers climbing beside
  it labelled with the frequency each one is currently sitting on.

**3. A REAL DEFECT THE BLEND SUITE FOUND, AND WHAT FIXING IT COST.**
Registering the three new routing lists in `BLEND_DRAW` was necessary and
was not sufficient: the suite still read **503/504**, the one failure a
voicing error nowhere near the effects — synthwave/bladerunner at 75/25,
seed 4, bar 3. Counting the rejections said exactly what happened: of twelve
candidate voicings, **the four close ones all landed on a pitch another part
strikes, and all eight opened ones fell below the floor** — a dropped voice
would have been playing under the bass. Both filters were right. The chooser
had simply run out of chords to look at, because the tones are folded into
the BOTTOM of the keys band and the inversions climb one voice at a time:
base 48/51/56 yields 48/51/56, 51/56/60, 56/60/63 and stops, while 60/63/68
sits inside the same band, untouched, colliding with nothing. **The band had
room the candidate list never used.**

So: when the first pass finds nothing, the same candidates are offered again
shifted by whole octaves, filtered by the SAME floor and the SAME ceiling
and scored by the SAME cost. Not a relaxed law — more of the register the
genre already granted. **504/504.**

**AND THE HONEST PART.** It runs only as a fallback because an octave-up
placement is often CHEAPER on bar 0 (where cost is distance from middle C),
so offering it always would re-voice comps across all seven genres — a
change to what the record plays, hidden inside a change to what the effects
do. Even as a fallback it is not free, because `tryPad` SWALLOWS this
exception for the second keyboard: a pad that used to degrade to its
second-choice band now fits in its first. Measured both ways:

- `mk2_snapshot`: **91 of 2100 seeds changed** — the baseline is re-recorded
  at `3a06b1c1b32aea33` (was `a687db612285f96d`).
- Final performance events, HEAD against this build, 7 genres × 300 seeds:
  **7 songs of 2100 differ**, every one of them a song with a second
  keyboard loaded, and the differing events are **1129 `keys2` notes and 4
  `counter` notes**. No main comp, no bass, no drums, no lead moved.

**4. `probe_matrix` WAS ACCUSING FOUR INNOCENT KNOBS.** It checked whether a
crossing's SOURCE row was playing and never whether its DESTINATION column
existed, so synthwave — which seats no DP/4 — reported `leadDP4`, `echoDP4`,
`roomDP4` and `flangeDP4` at −98 dB under the file's harshest label, "a knob
that does nothing", for correctly feeding a unit this genre never loaded.
The destination's own Mix crossing already answers it, exactly as the
source's does. Fixed, derived, no table.

**5. AND `probe_wiring` HAD NO BARBERPOLE COLUMN THE BUILD AFTER ONE
EXISTED** — the staleness this probe was written to catch, inside this
probe, one build later. Its effect columns were the literal strings
`"flange", "dp4"`. Now the FX columns come from `MATRIX.outs`, which
`MK2.MATRIX` exports for the purpose, and each column names the genre field
that fills it (`feeds:`) so nothing has to know that the room's list is
called `feeds` while every later column's is `<name>Feeds`.

**And the first derived version was WRONG in an instructive way.** Reading
`space.feeds` reported the ROOM as used by two genres, when the room column
arrives open for keys and lead whatever a genre declares — all seven use it.
So the question is asked of the CROSSINGS instead: a column is reached when
some crossing into it has a non-zero base, which covers the defaults and the
declared lists alike. Reading a genre's declaration is not the same as
reading what the grid does with it.

    genre        Echo Room Flange DP4 Barber pan kitPan width spread preDly cuts
    lofi          yes  yes   -     -    -    yes  yes    yes    -      -     -
    synthwave     yes  yes   -     -   yes   yes  yes     -     -      -     -
    dkc           yes  yes   -     -    -    yes  yes     -     -      -     -
    bladerunner   yes  yes   -     -    -    yes   -      -    yes    yes    -
    acid          yes  yes   -     -    -     -   yes     -     -      -     -
    plastikman    yes  yes  yes   yes  yes   yes  yes    yes   yes    yes   yes
    jungle        yes  yes   -     -    -     -   yes    yes    -      -     -

Battery **118/118**, blend **10/10 (504/504 pairs)**, ui **26/26**, renders
repeatable on all seven, snapshot IDENTICAL against its new baseline.

**AND THE RENDERED-AUDIO BATTERY, RE-MEASURED — a correction to this file's
own state table.** It reads "355 passed, 0 failed" at the top and later
entries have said "543 pass, 8 long-standing fails". Neither is what it does
now: **316 passed, 15 failed**. Rendered again from the commit BEFORE the
barberpole (`7224caf`, a separate worktree, same seeds): **the same 15, to
the last digit**. Nothing in this build broke them.

**13 of the 15 are one check that the stereo build made stale.** `"reverb
return present, at depth"` measures side/mid and fails it above a ceiling of
`max(0.16, wet)` plus a gate allowance — a ceiling calibrated when **the
reverb was the only thing in this program making side energy**. The stage
now pans the players, so side/mid runs 0.16–0.28 on lofi and a correct mix
fails a check written before it existed. The other two are a half-dB peak
ordering on seed 2 and L/R +1.6 dB on two choruses (a stage that leans).

Recorded in `docs/BACKLOG.md` §1 with the warning attached: **do not just
raise the number.** That check's whole value is failing when the return
disappears, and a ceiling chosen to make today's mix pass proves nothing.
The right fix derives it from what is actually panned.

**THE TASTE CHECK WAS PREPARED, AND PREPARING IT FOUND A DEFECT
CLASS — 2026-08-03, docs and harness only, no program change, the stamp
stands at `2026-08-03o` and the published artifact IS this build (stamp
check green).** Per BACKLOG §0 and START-HERE, this session built the
sitting instead of stacking more work: the backlog now opens with
six songs — seeds verified on this build, timings computed from each
song's own sections, one or two plain questions each, every verdict wired
to a decision. plastikman 11 (the effect-cuts at 0:59/1:58, verified off
the compiled plan, not remembered), jungle 1 (bridge 3:02–3:24), synthwave
1 (stage opens at 0:42; the CS-80 verified seated right this seed, +0.20
chorus, seed 4 left −0.49), bladerunner 1 (the FDN room, 62 ms pre-delay,
the 1.4 s bloom), lofi 1 (two keyboards opposite, Suitcase sway), dkc 1 /
acid 1 as a quick pair, and MONO CHECK if there is budget.

**The defect class: a section-keyed mix move on a bus the arrangement
keeps silent in exactly that section.** Chasing why no lofi seed 1–8
plays lead in its outro turned "check the guide's claims" into
measurement: lofi's outro Tubby pair can change **−95.8 dB** of the outro
(control: −5.6 dB where the lead plays), jungle's bridge drum-drop
**−90.5 dB** (control −6.4). Details, the plastikman counter-example
that proves role-tables cannot answer this, and what would close it:
BACKLOG §1. The measuring arm is new and permanent —
**`harness/probe_section_motion.js`**, probe_matrix's difference-signal
method pointed at every `kind:"section"` matrix/echo move inside the very
section it is keyed to. A table, not a pass/fail, because a half-live
move (one live section key of three) is a judgement call.

Battery at `61e607c`: seam **118/0**, blend **10/0**, snapshot
**IDENTICAL** (2100 seeds, `3a06b1c1b32aea33`), voices **0 threw /
0 silent**, stamp **green**. ui and midi each dropped one wall-clock
check on a first run under load (25/1, 19/1) and read **26/0** and
**20/0** on immediate rerun — the documented flake; the first UI
failure's name was not captured before the rerun, said honestly. The
rendered-audio battery was not re-run: nothing touched the sound.
