# START HERE — the prompt for whoever picks this up next

*Everything below is verified at `2026-08-15i` unless it says otherwise (the
newest build; its entry is under "What happened last"). If you
are an AI coder starting a fresh session on this project, read this file
first and then the two it sends you to. If you are the user handing this to
someone, the whole file is the prompt — paste it as-is.*

---

## The branch

**`claude/code-review-6jd9cz`.** All work goes here. Do not open a new
branch, and do not push anywhere else without asking.

```bash
git fetch origin claude/code-review-6jd9cz
git checkout claude/code-review-6jd9cz
git log --oneline -3      # expect the note scaffolding at the top

# AND CHECK YOU ARE ON THE BRANCH AND NOT ON main. `main` is a snapshot taken
# 2026-08-03 and the branch is dozens of commits past it; a session handed
# `main` looks clean and is simply old. This has happened.
```

> **The container has rolled this clone back to an old commit more than once,
> twice mid-task.** If `git log` shows a HEAD you do not recognise, you have
> been rolled back: `git fetch origin claude/code-review-6jd9cz && git reset
> --hard origin/claude/code-review-6jd9cz`. **Commit and push early. Do not
> sit on work.**

## What this is

**Deckard's Orchestrator MK2** — one self-contained HTML file
(`Deckards Orchestrator MK2.html`, ~6.3 MB) that generates music through a
six-stage pipeline. No build step, no dependencies, no server. Open it in a
browser and it plays.

**How many genres it has is deliberately not written here.** Ask
`MK2.genres()` — the command is in `docs/START-PROMPT.md`. Every document in
this repo said "seven" until 2026-08-07, when the answer had been **eight**
for some time: `dungeonsynth` shipped and no sentence was updated. That is the
DERIVE, NEVER LIST rule failing on the sentence describing the program itself,
which is the most-copied sentence in the repo and therefore the worst one to
hand-write.

It is **personal**. It is not for sale and it is not being distributed. Do
not add analytics, telemetry, licensing, onboarding, or anything else that
belongs to a product rather than to an instrument.

## Read these three, in this order, before touching the HTML

1. **`docs/HANDOFF-MK2.md`** — the whole file. It is long and it is the
   contract. Its §0 is the one rule that matters and it is about honesty.
2. **`docs/BACKLOG.md`** — everything outstanding, each item with why it is
   open and what would close it. **Its §0 outranks every task in it.**
3. **`docs/genre-research/NOTES-FROM-THE-USER.md`** — the running log of
   what was measured, what was wrong, and why. Read it *with* the handoff.

Then, as the work needs them: `docs/genre-research/*.md` (every genre and
every unit, with named sources), `harness/README.md` (what each tool
measures and which are slow).

## How to talk to the user

**RULE ZERO, and it is written in full at the top of `README.md`: PLAIN
ENGLISH, ALWAYS.** The user is not a musician and not an engineer. Jargon has
been rejected repeatedly and it kept happening anyway, so as of 2026-08-03 it
is a rule with a word-swap table attached — read it before you write anything,
including commit messages and docs.

Say what a thing DOES, not what it is CALLED: "the second keyboard plays in
every bar and never stops", not "the harmonic-filler layer is doubled". Numbers
are welcome; borrowed vocabulary is not. If they have to ask what you meant,
the writing failed.

**Report what happened, not what you hoped happened.** If a test fails, give
the output. If you skipped something, say so. This project's most expensive
history is a string of confident "fixed" claims that were false.

## The four principles the program is built on

1. **Constraints, not baked-in values.** A genre is a table of ranges and
   weights, never a hardcoded number in the builder.
2. **Soft laws and hard laws.** A hard law throws. A soft law is a cost the
   chooser pays. **A constraint that can be unsatisfiable must be a cost** —
   that exact mistake has been made and fixed at least three times.
3. **Music theory is the physics engine.** Not decoration on top of random
   notes — the thing that decides what is possible.
4. **Music is novelty, constrained** — driven by arithmetic and randomness,
   not by a library of canned phrases.

## The rules that are not negotiable

**RESEARCH EVERY TIME.** Any genre or unit you touch gets fresh internet
research, and it goes into `docs/genre-research/` as its own file with named
sources — not into a commit message, which is where findings go to be
forgotten. **Prior research does not count as new research.** The user's
words: *"use what we have and you find more — always"*, and — put plainly — this
program cannot judge how anything sounds, so measured data is the only way it
improves. Mark anything you
chose rather than sourced as `[CHOSEN]`.

**DERIVE, NEVER LIST.** Anything that writes out what the program contains
will go stale — it has happened four times, three of them in one session.
`MK2.MATRIX`, `MK2.INSTRUMENTS` and `MK2.racks()` are exported so nothing
has to keep a copy. And **ask the question of the thing, not of the
declaration**: reading a genre's stated sends list once reported the reverb
as used by two genres when all seven use it.

**BUT DERIVE THE SET, NEVER THE WORDS.** 2026-08-07: the drum rack's loadable
channels take their list from the voice table, which is right — and that put
**thirty-four variable names on a front panel**. `erangDrum`. `psgOpenhat`.
`dacGhost`. `oh808`. `brk`. Reported immediately, and correctly, as horrible
practice. A key is how the program refers to itself; the person using it is
not a programmer. So the SET is always derived and the WORDS are always a
table — with a seam check walking the derived set and failing on anything
unnamed, which is what stops the table going stale. Every list this rule
touches that reaches the glass needs the same pair.

**THE STAMP AND THE ARTIFACT MOVE TOGETHER.** The program the user plays is the published artifact, not the repo. Once it was three commits behind
while both files carried an identical stamp, so three commits of work went
unjudged. Bump the stamp in the HTML, run `node harness/mk2_stamp.js write`,
and republish **the same artifact URL**:
`https://claude.ai/code/artifact/b7004a11-15b7-4e76-be6e-dd39bb86ed06`.
Current: `build 2026-08-15i`. **And read the stamp back off the LIVE PAGE
afterwards** — `mk2_stamp.js check` compares the build to a RECORD of what was
published, which is not the same claim as the page agreeing with either.

**THE SAX IS PARKED.** The user's verdict, after every metric on it came
back green. Do not un-park it without the terms in the handoff's warning
block. Same precedent applies to the Random Hall reverb, which ships OFF
because the measurement refused it.

**No pull request unless the user asks for one.**

## What happened last, and what to do next

**Build `2026-08-15i` — THE OWNER'S REVIEW, ANSWERED WITH MEASUREMENTS.**
*"I feel like the gurdy is not correct... the drone mixer fader is dead. The
Takio is not sounding correct... its a good rough draft but its not complete
yet."* All three were real:

- **The drone fader was dead since the lane was born** — MIX_ROLE_BUS never
  gained a drone entry, so the strip's fader/EQ/meter wrote into a channel
  that did not exist while the audio fell through chanIn's fallback into the
  keys bus. The role now has a real channel in front of that bus (proven:
  strip −30 dB → rendered drone −25.1 → −55.1 dBFS). **A drone bus of its
  own is a matrix-row job, recorded, not done.**
- **The gurdy**: tied notes enter at the loop (the wheel no longer restarts
  per note); the drone strings are an ADDITIONAL layer — `dronebox.strings`
  rides the same swell/level/fader as the synth stack (DS carries 0.4,
  measured +7.4 dB of wheel under the drone); the short-lived drone POOL is
  gone; loop seams crossfaded 40 ms in the encoder.
- **The taiko**: the kettledrum release was chopping the great drum's 3 s
  ring with a 15 ms ramp (now a 0.35 s skin release), and lane levels were
  off by a 19 dB spread against the dungeon kit (great drum +6.6, high drums
  −9, ticks −12). Per-drum trims are the A/B's own corrections; re-measured,
  every lane within ~2 dB of the genre's contour.

Battery 178/1 (the ruled blend). NOT judged by ear — the review continues
there.

**Build `2026-08-15h` — THE MIXER NAMES EVERY PART'S INSTRUMENT, AND THE NAME
IS A DROPDOWN.** The owner corrected `15g`'s placement: *"they show up on the
master mixer so thats probably where this should be. Each part like the lead
for example should name what instrument it is and this should be a drop
down."* Right — the rack pickers ride the machine panels, and the desk is
where the parts are listed. Every part strip now carries a select under its
name plate: the first option is WHAT IS PLAYING NOW, read from the record's
own events ("bass · contrabassoon", "gurdy drone strings"), the list is every
instrument that can hold the part (canFill, one owner) plus "none". The
DRUMS strip names its KIT ("war drums and kettles" → "taiko drums") through
picks.kit. Same PICK + recompose() doors as the rack pickers, so both stay
in step and the music carries on from the same second. Verified end-to-end
in Chromium; probe_mixer 4/4, probe_desk 11/11, battery 178/1 (the ruled
blend). NOT judged by ear.

**Build `2026-08-15g` — A RACK FOR EVERY PART, AND DUNGEON SYNTH DEALS ITS NEW
INSTRUMENTS ITSELF.** The owner: *"create ui that lets the user select the
instruments they want for the song for the different parts and to be able to
add more instruments"* — and the two parts a hand could never touch got their
racks: **counter ("answer") and ostinato ("figure")**, appended to RACK_SLOTS
so no existing draw moves, 27 pitched boxes pickable on each, verified
end-to-end in Chromium through the real dropdowns. And the genre half:
dungeon synth's pools grew by the owner's word — **contrabassoon on the bass
(11/40 records), gurdy drone strings on the drone lane (18/40), hurdy-gurdy
on keys2 (10/40)** — all register-neutral by the arithmetic (each range
CONTAINS its band), 12/12 DS records keep their exact notes, nine other
genres byte-identical. The new drone pool also exposed probe_reachable's
five-slot pick literal (predating the drone slot); it derives from
`rackSlots()` now. Battery 178/1 (the ruled blend). NOT judged by ear.

**Build `2026-08-15f` — TAIKO, CONTRABASSOON, HURDY-GURDY: THREE RECORDED
INSTRUMENTS IN ONE DAY.** The owner: *"Taiko drums absolutely, lets get the
contrabosson from the sample collection you mentioned, Lets try harder to
find a hurdy gurdy."* All three found, licensed, measured, built:

- **Taiko** (SCC Taiko v1.0, CC BY-SA 4.0, via `floe-audio/Taiko-Drums`) —
  eight drums, each with soft/median/loud takes RANKED BY MEASURED RMS (the
  take labelled f2 measures quieter than the one labelled p), IMA ADPCM as
  the Erang bank's second payload. `TR-1000 · TAIKO` kit, sticks on the tick
  lanes. **Dungeon synth's kit is a 6/4 dungeon/taiko DRAW** consuming the
  stream call that already ran discarded [Law 7]: 13/30 DS records draw
  taiko, 12/12 note-identical, other genres byte-identical.
- **Contrabassoon** (Philharmonia recordings; free-to-use, weaker than CC0,
  stated) — 160 notes measured by the brass analyzer's rules into a guest
  member of `BRASS_WT` (the AUTO chair deal never reaches it). Caveat
  carried: the mirror's files are level-normalised, so layer trims are
  unity. A machine beside the synthesised bassoon; in no pools.
- **Hurdy-gurdy** (MidiGurdy factory soundfonts, CC BY-SA 4.0 — a real
  French gurdy; found after Sonokinetic proved Kontakt-locked and Pianobook
  login-walled) — `harness/gurdy_bank.py` parses the sf2 itself, measures
  every root (two zones >60 cents off their own declared correction,
  dropped), keeps the soundfont's loop points. 19 chromatic zones D4..Bb5,
  recorded keybox clicks at press and release, the chien buzzing on
  accents, and the recorded drone strings as a second DRONE RACK machine.
  In no pools; pickable by hand.

Wiring rule held throughout (the bastion lesson): only dungeon synth's kit
draw touches a genre; every other genre byte-identical, measured. Battery
**178/1** (the ruled blend). Renders proven in Chromium. NOT judged by ear.
Skipped for want of a recorded source, stated: the chien's sustained growl
(loop sits 8 s into the take), cup mute, bass trombone. VSCO-2-CE also holds
an unused recorded bassoon/oboe/clarinet/strings/organ and a real ANVIL —
the DS sources' own instrument — recorded in `brass-arranging.md` §8 and the
backlog.

**Build `2026-08-15e` — THE BRASS LANDS, RECORDED, AND THE SECOND CHAIR IS A
NEW RIG.** The owner picked it from the shortlist: *"Brass. Make sure to do
research about how to arrange brass. Make sure to look online for free brass
open source that we can use."* Both halves are done and both are in
`docs/genre-research/brass-arranging.md`: the arranging rules (ranges, the
subgroup-as-harmonic-unit rule, overtone spacing, the trombone f stick-out,
mute filter numbers with Hz, endurance) with every number cited, and the
source settled on **VSCO-2 Community Edition** (`sgossner/VSCO-2-CE`,
**CC0-1.0**, pinned commit `4403009`) — per-note recordings of horn, trumpet,
tenor trombone, tuba, and three REAL recorded mutes. Iowa MIS verified as
fallback and recorded so the next search does not start at zero.

The encoding is the sax's engine, not embedded PCM: `corpus/analyze_brass.py`
(two passes — the filename fixes only the pitch CLASS, the octave is measured;
VSCO names an octave below sounding, one subharmonic lock and one
harmonic-locked file caught, a two-note swell layer refused the horn's ff
slot) emits `BRASS_WT`, 44 KB for MIDI 29–84. `V.brass` morphs phase-locked
pp/mf/ff spectra, so the crescendo blazes because the ff recording blazes —
centroids measured, straight mute 6.2 against the open bell's 2.8. The CHAIR
dial at SECTION deals each note to the member whose register covers it (tuba
to A2, trombone to G#3, horn to B4, trumpet above, boundaries [CHOSEN] from
the sheet's chord bands); 1–4 force a solo chair; MUTE swaps to the recorded
muted spectra and honestly does nothing on the chairs the source never
recorded muted.

**The wiring lesson: a NEW RIG, `bastion`, and the citadel untouched.** The
first wiring edited the citadel's chair and the snapshot caught two kinds of
collateral: hobbit synth also stages the citadel (its records moved), and the
brass's declared range recomposed every pool and ladder it joined. So the
bastion is the citadel with the recorded section in the second chair, staged
only by dungeon synth's rig table, and the brass machine sits directly after
the horns in `INSTRUMENTS` so the doubling-partner pool keeps its shape.
Measured over all 3000 snapshot rows: **hobbit synth and eight other genres
byte-identical; 91 of 300 dungeon synth records move** — 64 as pure voice
renames (the chair and the heroic doubling, horns → brass), 27 redraw one
role's drawn doubling because the section's real range [29,84] now refuses a
line it cannot play (the doctrine working, stated not hidden).
`harness/probe_brass.js` (11 checks, Chromium: tables, cuivré, the chair, the
deal/mute/rank A/B'd on renders) guards it; battery **178/1**, the one red
the owner-ruled blend throw. NOT judged by ear yet — no build is until the
owner listens.

**Builds `2026-08-14a` … `2026-08-15d` — PROG-TECHNO IS GONE, AMBIENT IS BUILT
ON A REAL DRONE, AND MUTABLE INSTRUMENTS' OWN SOURCE IS PORTED.** The owner's
words started it: *"I dont believe that you have actually built drones but if
you have we have all the fx, instruments and drones to make an amazing
ambient genre built around drones"* — and the scepticism was correct.
Ten genres × six seeds, events reaching the one drone voice the file had:
bladerunner 450 (longest 16.55 s), everybody else **0**. Dungeon synth and
hobbit synth both declared `bassStyle: "drone"` and put the plucked `V.bass`
on the lane instead, longest held note 4.80 s and 2.54 s. That is what "no
drone" actually meant, from the outside.

**Prog-techno is deleted, not commented out.** `docs/genre-research/
prog-techno.md` stays, with a withdrawal note — several of its mechanisms
(the structural solo, the drawn matrix vocabulary, poly on pitched parts)
outlived the genre. `ambient` replaces it, written against
`how-a-drone-evolves.md`'s own ranking of long-form mechanisms: `form.roles`
IS the form (the drone alone, then a bed, a figure, a voice, and a bridge
where the drone itself LEAVES); every LFO pair on the table is coprime.

**The drone is a real lane now** — `INSTRUMENTS.dronebox`, `SLOT_OF.drone`,
its own mixer strip, MIDI track, rack slot — not a bass engine competing with
the bottom end for the one slot a genre gets. Its face is a Mutable-styled
control room: **Marbles and Tides drawn as actual eurorack clone
faceplates** (aluminium, rack screws, jacks), and two of the three ported
files (`marbles/random/random_sequence.h`, `marbles/random/t_generator.cc`,
`tides2/poly_slope_generator.h`, fetched raw from `pichenettes/eurorack`, MIT,
Emilie Gillet's copyright carried in the comments) caught the FIRST version's
manual-based guess getting Marbles' déjà vu backwards — the real mutation
curve is `p = (2·dejavu − 1)²`, and below the notch a mutation REWRITES a
loop slot rather than drawing fresh noise. A resonator (a comb the echo could
never be — its shortest delay is ~132 ms and its feedback caps at 0.85) and
Frames-style scenes (STORE A / STORE B / crossfader on the bank's glass) are
built too. Serial routing — the OTHER Octatrack idea on the owner's list — is
still open and is not rushed: it needs a RES column on the matrix, and the
matrix's builder, `routeBaseFor` and `probe_wiring` all walk that column list
by hand.

**Dungeon synth's drone was rebuilt twice in one day, and the second attempt
is the one that shipped.** The owner: *"It feel like you did much more than
adding a drone to dungeon synth it feels like you messed it up."* Correct —
the first attempt put `"drone"` inside `form.roles`, and the genre's rest,
strip and thin draws all pick from that set: keys went 597 → 732 notes and
the bass register moved, from adding one part. Reverted whole, then rebuilt as
a DECREE — a genre that declares `drone` without naming it in `form.roles`
gets it added to every section AFTER every draw over the active set has
already run, so it cannot be a candidate for anything that reads that set.
Twelve seeds, every non-drone event of dungeon synth SHA-identical to the
build before any of this started; 37–41 drone notes added per record.

**And the modulator bank was found half dead.** `rideBus` and `motionAt` both
returned early for a destination the current GENRE did not itself automate —
so a hand-patched bank slot did nothing on any song where nobody else had
already wired that destination, silently, differently per genre. Proved by a
render A/B: −100 dB (numerical dust) before the fix, −43.7 dB (real audio,
matching a known-good destination's −37.6 dB on the same test) after. Bank
destinations: 12 → 22.

Verification throughout: `mk2_test.js` steady at 177 passed / 2 failed (the
build stamp, which is expected red until republished each time, and the
blend throw named below); blast-radius A/Bs — SHA-1 over every event of every
untouched genre — at ZERO for every build in this run except the one genre
being deliberately changed; `probe_dronerack.js` (new) driving the real panel
in Chromium.

**⚠ THE OLDEST NAMED DEFECT IN THE FILE IS NOW THE EASIEST TO REPRODUCE.**
`BACKLOG.md` §0a.16, the blend's out-of-key lead — `lofi`×`dungeonsynth` and
`lofi`×`hobbitsynth`, always the chorus material, always bar 3. It has been
called "pre-existing" and stepped past for a long time. Dungeon synth's
rebuild moved which bars its materials land on, which moved WHERE the same
two pairs hit the throw across the blend slider's weight range — `mk2_ui.js`'s
own blend drag now reproduces it on nearly every run instead of intermittently.
Same defect, not a worse one. **RULED ON BY THE OWNER, 2026-08-15: "thats not
a concern there are better things to tackle."** It stays recorded and it stays
out of the way — do not nominate it as the next job again; the owner decides
what gets tackled, and two throws in 1,080 blend combinations on two specific
slider positions is not where the music gets better.

**Build `2026-08-10e` — THE KETTLES ROLL, THE HAND DRUM LEARNS ITS FIGURES.**
The owner asked for the orchestral element ("like the score from Lord of the
Rings") and drum creativity. Researched first
(`docs/genre-research/dungeon-synth-score-and-drums.md` — the orchestral claim
is in-genre: RYM's own page, Summoning, Murgrind), then built the two
percussion gestures the sources name and the kit could not make: **timpani
rolls** (`art: "roll"` — literal repeated single strokes, faster on the higher
kettle, a measured 15 dB crescendo ending on the next downbeat; half of fills)
and **martial hand-drum figures** (`kit.snarePocket`, drawn per material,
with voice-level **drags** — the lane played the identical `[8]` in every song
forever and now draws from six figures including silence). Other genres
byte-identical; snapshot moved 600 lines, all dungeonsynth. **Brass is the one
score voice the program lacks and it is NOT invented** — the sheet's §6 is the
path: recorded patches on `main`, the Erang encoder pipeline embeds them.
**And §6's answer to "can the program load WAVs from main at runtime" is NO
for the page the owner actually plays** — the artifact's platform blocks
external requests — with the working alternative written down.

**Build `2026-08-10d` — DUNGEON SYNTH DAY: THE HELD NOTE, THE SHELF, THE SEAMS,
AND THE WEATHER.** Four slices, each measured, each asked for directly:
*"using legato where needed, the correct audio levels, the correct low mid,
highs... all the instruments in the Errang set... bring in more of the FX
sounds properly."* All in `docs/genre-research/dungeon-synth-fx-and-balance.md`.

- **Legato** on the tune and the second keyboard — the tune rang 0.82 s and
  left 1.77 s of silence on a machine with a 0.55 s attack. After: +3.5 dB of
  ring, silence share 26% → 2%.
- **A −3 dB low shelf** — the record had 66–75% of its energy in 60–200 Hz
  (the pack's own patches centre at 330–656 Hz); the drum bus was paying
  11.5 dB of headroom for 2.4 dB of loudness. After: centroid 193 → 332 Hz,
  drum crest IMPROVED, march still the loudest part by 11 dB RMS. And the
  bass fader was tried and REVERTED: +2.7 dB moved the drone's leave-one-out
  from −0.01 to −0.01 dB — its inaudibility is register physics, recorded as
  an open design question.
- **Automation at the seams** — the genre declared ZERO gestures while fills
  recur 7–10 a song (the 10a lesson, unapplied here). Four fill gestures and
  a matrixDraw pool (room and echo only — no flanger in a crypt). Lanes now
  swing 20–60% of dial; clamp check green.
- **The weather** — the pack's ten unplayable sfx/Noise files play: eight
  loopable BEDS (one per song, on the tape role's rail, −38.9 dB measured)
  and two one-shot ACCENTS spent once on the peak (Belkin's saved colour).
  **All 65 Erang sounds are now reachable.** Snapshot moved 600 lines, all
  dungeonsynth, note-hash unchanged; battery 173+stamp, ui 68/0 (one flaky
  first run, both reported), blend 20/20, midi 20/20.

**Build `2026-08-10b` — TWO THINGS, BOTH ASKED FOR DIRECTLY.**

**The genre's own subject was a minute late.** `probe_stems` reads the first
seventy seconds; in prog-techno's, the seven-note cell the whole thing is built
on contributed **0.86 dB** against plastikman's 3.57, on 42 notes against 105.
The opening was drums and almost nothing else. The cause was the arrangement
gate — `form.build.enter.ostinato` at `[0.11, 0.07]`, which on a 538-second
record is **59 to 97 seconds** of waiting. Now `[0.04, 0.04]`: **161 notes,
3.36 dB**, level with plastikman, and the drums come back from 6.39 to 2.18.

**AND THIS REPO NO LONGER TALKS ABOUT EARS OR LISTENING.** Four corrections did
not stop the words coming back, so they are gone. `test/ears/` deleted. The
`[EAR]` notation — 554 across 55 files, meaning *"chosen by me rather than taken
from a source"* — is **`[CHOSEN]`**. Every `NOT HEARD` tag, every "listening
brief", every "the honest next step is a listen": gone. `kit.listen` is
**`kit.answer`**. Untouched on purpose: `addEventListener` (a browser API) and
`docs/genre-research/raw/*.json` (verbatim source captures — editing what a
source said would falsify the research).

**The rule those words were carrying, written without them:** this program
cannot judge how anything sounds. Measurement and research are the only way it
improves, the owner is the only judge, and waiting for a verdict is never a next
step to propose.

**Build `2026-08-10a` — THE FX ACTUALLY MOVE NOW, AND ONE OF THEM NEVER HAD.**
The owner: *"Your not doing anything with the fx. Your not building sweeping
motions quick nor long movement. Its all wrong, the song takes so long to get
into anything and you dont even bother to do anything with all that time."*

Two separate faults, and only the first was the one I expected.

**Every gesture was on a trigger that fires once.** `peak` and `build` both key
off the single apex section, so a gesture written on either happens ONCE in an
eleven-minute record — and every gesture in prog-techno was on one of them.
`fill` recurs **9.8 times a song** and nothing in the genre used it. Underneath,
free LFOs were swinging the hat filter 7000 Hz a minute: motion with no
departure and no arrival, loud enough to bury anything directed. Fixed, and the
record is ~9 minutes instead of 11.5 with an arc that climbs 0.30 → 0.89 rather
than sitting at 0.13 for four minutes.

**And then the one nothing could see. A CROSSING IN THE SEND MATRIX IS A SWITCH
BEFORE IT IS A KNOB.** `applyRack` turns routing-list membership into **0 or 1**,
and motion is an **additive offset** that gets clamped. So a routed send is
already at the top of its dial, and:

> **a routed send can only be played DOWNWARD.** It rests partly closed and
> OPENS to full at the arrival. An unrouted one is the mirror image.

Nine lanes across four genres pushed the wrong way and travelled as little as
**0.00% of their dial in every song ever made** — including one whose own comment
three lines above said *"a route tops out at the wire, so every move here is a
CUT"*, with the lane beside it pushing up.

**Why the harness was green on all of it, which is the part worth carrying
forward:** the range check tested `clamp(x)` against the range the clamp
enforces — it can never fail. The swing check measures `motionAt`, the OFFSET.
`probe_automation`'s TRAVEL column measures the offset too. **Nothing measured
what the voice reads**, which is `clamp(base + offset)`. The new check does, and
fails a matrix lane keeping under a quarter of its written swing. BACKLOG §0e
has the two things still open, including that **the snapshot does not hash the
motion plan at all**.

**Build `2026-08-09f` — THERE IS A NINTH GENRE: prog-techno.** Pink Floyd
crossed with punk on a techno backbone, which is how the owner put it. A locked
groove that does not change, a repeating figure of seven notes that walks against
the bar and lands accented when it comes home, and a solo that is silent for the
first third of the record and then arrives. Dark, funky, about ten minutes.
`docs/genre-research/prog-techno.md` has the sources and the four corrections
that got there.

**⚠ AND THE TWO MECHANISMS IT NEEDED ALREADY EXISTED**, which is worth knowing
before you build anything here. The pitched cycle is `ostinato.run`, Berlin
School sequencing that has been in the file for weeks; all it lacked was the
homecoming, and `sam` is one condition and one multiply. The structural solo is
`form.arc.thin` plus `form.build.enter`, both already there. **Look for the
mechanism before you write one** — this is the fourth time in this file's history
that the thing was already present and unreached.

**⚠ AND `const BARS = 4` IS GONE THE SAME WAY `verse: 16` WENT.** A material was
four bars for every genre, forever, and a seven-note cycle can never come home
inside four bars. It is `materialBars` now, defaulting to 4. That flushed out
three places assuming a material and a chord progression are the same length.
**If you find a constant that every genre happens to share, it is a constraint
nobody has needed yet, not a fact.**

**Build `2026-08-09e` — YOU SET HOW LONG THE RECORD IS.** A dial on the
transport, 1:00 to 20:00, on every genre. The song is BUILT to that length —
it still gets its intro, its build, its peak and its outro — rather than cut to
it. Worst miss across 8 genres x 5 lengths x 4 seeds is 31 seconds. The header
says what you asked for beside what came out. `mk2_roll --len 2:00`.

**⚠ AND THE REASON IT TOOK TWO GOES IS THE MOST USEFUL THING IN THIS FILE.**
The first version would not take dungeon synth below about seven minutes and I
**wrote that down as a floor** — four phases, sixteen-bar sections, 66 bpm,
therefore physics. The owner: *"Bullshit! A song can be any length if weve coded
it to be so ridged its fixed to one length weve done something very wrong!"* It
was `verse: 16`. **`form.lengths` was one hardcoded number per function, which
principle 1 forbids in as many words**, and it had been invisible for as long as
nothing ever asked a section to be a different size. Correct arithmetic on a
baked-in value gives a confident wrong answer and it sounds exactly like an
explanation. **When the program cannot do something, suspect the program.**

**Build `2026-08-09d` — and now every part of the mix can be AIMED.** Under the
sliders, each part of the record — the bass line, the drum kit, the swing, how
the song is built — has a little menu: leave it on *whichever*, or say *always
jungle* and it comes from jungle every time. What you did not aim, the sliders
still decide. Ask for something a genre does not have and it says so instead of
pretending. Read it in the notes:
`node harness/mk2_roll.js 1 --blend lofi:50,jungle:50 --trait kit=jungle`.

**Build `2026-08-09c` — the genre sliders mean what they say in every song.**
Set two of them to 50/50 and you now get a record that is half and half. You did
not before: every element of a genre tossed its own coin, so the average over
thirty songs was about right and any ONE record ran from 8/92 to 92/8 — a control
that is honest about a pile of songs and a lottery inside the one you are
playing. The elements are dealt like a hand now, and the worst record anywhere
across all 28 pairs is 45/55.

Two other things came out of it. The blend panel says **what the record you have
actually came out as** — which genre supplied the bass line, the drum kit, the
swing — because the sliders only ever said what you asked for. And **`deal
again`** gives you the same song with the same shares and a different half from
each genre.

Three faults turned up while measuring it, all fixed, all in
`docs/genre-research/breaking-the-rule.md` §8. The one worth knowing: the second
voice's style and the notes it is allowed to move by were being taken from
DIFFERENT genres in 73 songs out of 120, while a comment in the file said they
always travelled together. Nobody has played a blend since this changed.

**Build `2026-08-09b` — the drums now change from section to section.** The
largest open item in `BACKLOG.md` (§6.0 A) is built. A record had six to fourteen
sections with drums in it and three or four drum parts; four genres closed on a
drum part the person playing it had already heard, in 100% of songs. A section's drums are
now the genre's kit plus a ladder of moves, the rung set by how far into the
record the section sits, and the closing section takes the biggest change in a
drawn direction. All seven genres with drums moved. **Blade Runner did not, and
that is correct rather than a miss — it never plays drums: it composes a kit and
`drums` is active in 0 of 594 sections measured over 60 songs, so 0.0 drum events
reach the performance.**

Two things were built and then taken back out by measurement, both recorded in
`docs/genre-research/drum-sectional-arc.md` §6: per-section move draws made every
section unique (the shape the owner explicitly turned down), and the closing
change was landing on a section `thinTo` had already stripped of drums. One seam
check was rewritten rather than loosened, and the reasoning is in `mk2_test.js`
beside it. 

**Build `2026-08-08s` and before.** The 2026-08-08 run did five theory gaps and then grew
the roll a pair of hands. `HANDOFF-MK2.md` has every build in detail; the short
version, and the two things that matter most for whoever is next:

- `08n` the record can change key mid-song · `08o` the second voice answers the
  tune instead of shadowing it · `08p` two copies of one movement, one slightly
  slower (phasing) · `08q` the bass moves again — **reversed by taste at `08r`** ·
  `08r` the fills come back (they were locked behind a chorus and firing once
  every 933 bars in minimal techno) · `08s` **the hand on the roll**: click a
  note, get that part in that section, reroll / thin / thicken / octave /
  reverse / delete it, and undo.

**THE FIRST THING TO KNOW: nothing in that list has a verdict.** Every entry
ends with the same sentence in the HANDOFF. The owner is the only judge and the
backlog of unjudged changes is now the single biggest risk in this project — a
tenth measured-but-unjudged build is worth less than one judged one.

**THE SECOND: the owner reversed me twice in this run**, and both times the
answer was already written down. Read `docs/genre-research/NOTES-FROM-THE-USER.md`
from the bottom before you design anything. In particular: *"we can't always
have no changes, how can we make anything better if nothing ever changes?"* —
"0 of 300 seeds moved" is a SAFETY check, not a score, and reporting it as an
achievement is a habit to break.

**⚠ THE DRUM SECTIONAL ARC IS BUILT — `2026-08-09a`. Do not start it again.**
`BACKLOG.md` §6.0 A is closed; A1–A5 under it are what is left of that item, and
none of them is the mechanism.

**⚠ AND THE GENRE FADERS' QUOTA IS BUILT — `2026-08-09c`. Do not start that
again either.** §H step 2 is closed. The elements are DEALT rather than drawn one
at a time, so a 50/50 fader gives half of EVERY record and not half on average:
worst single record across 28 pairs went from **8/92 to 45/55**, each pair's
worst record from **31 points off half to 2**, and the two left are arithmetic —
an odd number of elements will not divide in two. The gate held (200 songs
IDENTICAL, structurally: a solo genre returns before the allocator exists).
`docs/genre-research/breaking-the-rule.md` §8 has the method and the three
defects the new tool found on its first day.

**⚠ AND SO IS THE LENGTH DIAL — `2026-08-09e`.** Step 4's goal is delivered as a
CONTROL rather than as a blend element, which is the better shape: *"i want to be
able to do things and set things."* Whether length should ALSO be blendable is
now an open design question and not obviously worth building — ask first.

**⚠ STEP 3 IS BUILT TOO — `2026-08-09d`. Do not start it again.** Every element
of a blend can be aimed: *whichever*, or *always <genre>*, on the blend panel and
on `mk2_roll --trait`. 594 element-and-genre combinations honoured; a pin
outranks the fader and the quota balances the rest around it; an impossible pin
is refused in words.

**What is open on the faders is steps 4, 5 and 6 of `BACKLOG.md` §H** — song
length as its own element, per-genre switches under each fader, and `drums2`
(the only one needing new machinery).

**⚠ AND DO NOT READ THE OWNER'S THREE SENTENCES AS A CHECKLIST.** *"My EXAMPLES
were meant to convey the idea NOT exact things to do."* §H used to list them as
the close condition and that was wrong; it is corrected there now. Build the
idea, use the examples to sanity-check the result by hand.

**⚠ AND THE UNJUDGED PILE IS NOT A STOP SIGN. Corrected twice now**, most recently
2026-08-09. The owner, in short: this program is not a human and cannot judge
sound — it can print what it made, and that is its instrument. Saying a build
has no verdict yet is honest. Proposing to wait for one
as the next job is asking the owner to authorise your idleness — and `BACKLOG.md`
§0 has said so since 2026-08-04. RULE ONE is the instrument you actually have.

**⚠ AND THE STAMP IS RED ON PICKUP, EXPECTED — but read WHICH red it is.** The
program changed and the stamp MOVED with it (`2026-08-09c`); what has not
happened is the republish. `mk2_stamp.js check` says so in those words. That is
the step not yet done, not the artifact drift the check exists for. Decide early
whether to publish; do not leave it red for a whole session.

**⚠ AND ONE CONTRADICTION BETWEEN TWO FILES, LEFT ALONE ON PURPOSE.** The section
below says no run times are written in these documents any more. `harness/
README.md` still has a whole column of them. One of the two is wrong and it is
the owner's call which; nobody should quietly delete a table the owner may have
wanted, and nobody should quietly re-add costs to the other files either.

## The commands

Build `2026-08-15i`. The commands, each in the DEFAULT form, which is the form
to use. `mk2_stamp.js check` tells you whether the file in front of you is the
build these documents describe — that, not a battery, is the pickup check.

```
node harness/mk2_roll.js 1 --genre <g>      the notes. RULE ONE
node harness/mk2_test.js                    the seam checks
node harness/mk2_test.js kit                ...only the ones whose names contain "kit"
node harness/mk2_snapshot.js check harness/mk2_baseline.snap    did the music move?
node harness/mk2_ui.js                      the front panel, real browser (flaky ~1 in 5)
node harness/mk2_blend.js                   the blend sliders
node harness/mk2_midi.js                    the MIDI port and the .mid export
node harness/probe_mixer.js                 the desk reaches the graph
node harness/probe_dronerack.js             the drone rack's panel, its LFOs, and whether a
                                             hand-patched modulator bank slot reaches rendered audio
node harness/probe_brass.js                 the recorded section: tables, cuivré, the chair,
                                             the register deal and the mutes A/B'd on renders
node harness/probe_drumarc.js               does the drum part have a SHAPE
node harness/probe_blendshare.js 30 --all   what share of a song each genre on
                                            the faders actually supplied
node harness/mk2_roll.js 1 --genre <g> --len 2:00        the notes, at a length
node harness/mk2_roll.js 1 --blend a:50,b:50 --trait kit=b   ...and aimed
```

**Three of those have a `--full` form and DEFAULT TO THE CHEAP ONE ON PURPOSE.**
`mk2_snapshot check` samples seeds; `--full` sweeps the whole baseline.
`mk2_ui` runs a fast core; `--full` adds the graph-growth check and the
declared-vs-drawn sweep. Use `--full` when you can say what it would see that
the default cannot, and say that out loud before you run it.

On a fresh clone, FIRST: `npm install playwright`. `node_modules` is not in
the repo and every browser probe dies with "Cannot find module 'playwright'",
which reads like a broken probe and is not. Do **not** run
`playwright install` — the browser is already in the image.

## THE TESTING RULE, CORRECTED 2026-08-07, AND AGAIN ON PICKUP

### ⚠ FIRST, THE ONE THAT KEEPS BEING GOT WRONG: ON PICKUP, RUN NOTHING.

**Starting a session is not working.** Read, orient, pick a job from the
backlog, start it. Do not run the seam battery, do not run a probe, do not
"establish a baseline" — the baseline is written in these files, and
`mk2_stamp.js check` already proves your file is the one it was written from.

**Because a battery is a DIFFERENCE instrument.** It compares the program to a
recorded number. With nothing changed there is no difference to find, so the
run cannot come back with anything you did not already have. It is a diff
against a file you know is identical.

Measured cost of getting this wrong on 2026-08-07: two runs of `mk2_test`
before a character of the program had been touched, the second killed by the
container for memory. The instruction that caused it was real — three copies
of "run all of these before you claim anything" were still sitting in
`HANDOFF-MK2.md` (§3 twice, §9 once) a week after this section replaced them.
All three are now deleted, and this paragraph exists because a correction at
the top of a file does not reach a reader who is 2400 lines down it.

**The one exception, and it is not a battery:** `node harness/mk2_stamp.js
check`. One second, and on pickup it is the only check that can genuinely come
back false — the artifact drifting from the repo is the failure this project
has actually had.

### The rule for when you ARE working

The previous version of this section said "run these before you claim
anything" and listed the whole chain. That instruction is why one session
ran the full chain eight times for a day's work, and the user paid for it.
It is replaced by the rule below, which is written from **measured** costs
rather than from an impression of them.

### ⚠ WHICH CHECK CAN SEE YOUR CHANGE? Most of them cannot.

*The user, 2026-08-07, on a run of UI-only builds: "It feels like your doing
tons and tons of seriously unneeded work! Of course NO no changed how could the
notes change when you working with the UI? Im just not understanding this."*

**There is nothing to understand — it was waste.** A battery is a DIFFERENCE
instrument, and that is not only true on pickup: it is true of every check
against every change. `mk2_snapshot` hashes the notes. Drawing a panel, naming
a knob, moving a select, changing a colour — none of those can move a note, so
the snapshot is a diff against a file you already know is identical. Running it
and then reporting "not one note moved" is not evidence. It is a sentence that
was true before the work started.

**So the rule is: run what can see what you touched.**

| what you touched | what can see it |
|---|---|
| labels, CSS, panel layout, what is DRAWN | `mk2_ui` only |
| a machine's declaration (controls, kits, panel fields) | `mk2_ui` + `mk2_test` |
| a genre table, a stage, a voice's notes, `voiceFor`, `resolvePicks` | + `mk2_roll`, **and the snapshot — this is what it is for** |
| the audio graph, a voice's SOUND | + the rendered-audio battery, `probe_render_determinism` |
| the blend sliders / the MIDI export | `mk2_blend` / `mk2_midi` — and only then |

**AND THE ONE THAT LOOKS LIKE A FALSE ALARM AND IS NOT.** The snapshot hashes
*every field an event carries*, on purpose — "a field added tomorrow is in the
hash tomorrow, by construction". So **attaching a new field to a note moves all
2400 lines even when no note moved**, and the honest response is not to shrug at
it and not to hide the field somewhere the hash cannot see. It is: hash the same
songs with the new field REMOVED, show that matches the old baseline, then
rewrite the baseline. That is what was done for `holdSec` on `2026-08-08d`, and
the one-off is worth writing again the next time it happens.

**And say which one you skipped and why.** "The snapshot cannot see a label" is
a better sentence than a green IDENTICAL, because it says you knew what you
were changing.

### The tools default to the cheap form. Let them.

**No run times are written in these documents any more, and that is
deliberate.** They were measured once, went stale, understated the worst case
badly — the full snapshot has been killed for memory on this machine — and
reading a price is what talks you into paying it. The user, 2026-08-07, after
watching the full sweep run three times in one session: *"Dont put the cost in
the docs that will just get you to do it again."* He is right, and the fix was
structural rather than written: **the expensive form is now behind a flag, so
it cannot be reached by habit.**

- **While working:** `mk2_roll.js` and `mk2_test.js`, and prefer the targeted
  form — a name filter on the battery, or a short query against the composer,
  when the question is about one seam. Add a probe if the question needs
  measuring: `probe_stems.js` for balance, `probe_static.js` for how much a
  record changes, `probe_palette.js` for which sounds a genre reaches.
- **Once, before publishing:** the snapshot, `mk2_ui.js`, `mk2_blend.js`,
  `mk2_midi.js`, and any probe the change touches.
- **Never** the whole chain after every edit, and **never a `--full` sweep by
  reflex.**

**AND THE REAL REASON THE RULE KEEPS BREAKING.** It is not forgetfulness — the
session that wrote this section broke it within the hour. It is that a large
edit leaves you not knowing what you broke, so you reach for a battery to find
out. **The fix is smaller edits, finished one at a time.** An unfinished change
is the thing you keep re-verifying.

**Run browser probes one at a time.** Four cores; four Chromium renders at
once finish slower than four in a row, and a combined run has been killed for
memory (exit 137).

### What these checks CANNOT see, and it is most of what matters

Every complaint the user made on 2026-08-07 — the drums inaudible, then
smeared, the chords buried, the roll unreadable, **the mixer with every
control dead** — was invisible to a green battery. Two specific lessons, both
paid for:

1. **A probe that reaches past the interface only proves what is behind the
   interface.** `probe_mixer.js` passed 4 of 4 while every fader and knob on
   the panel did nothing, because it called `MK2.setMixer` directly and the
   panel's own call went through `window.Sound` — which is `undefined`, since
   `Sound` is a `const` and const never lands on `window`. **For anything with
   a knob on it, the check that counts is the one in `mk2_ui.js` that drives
   the real element with real pointer events.**

2. **A probe can be measuring a different program than the one that plays.**
   `probe_stems.js` called `renderWav(list, secs, rate)` and stopped there —
   no space, no kick voicing, no drum drive, no motion. `chTune` returns 1 flat
   on a graph with no drum machine, so the war drum's tuning was switched OFF
   in every reading it had ever printed, and a whole round of drum changes came
   back "identical to the decimal". Before believing any measurement: was the
   machine in the slot, was the sound passed, was the motion plan passed, was
   the window long enough.

3. **RMS is not loudness.** The drums measured -13.6 dB and **-39.9 dB
   A-weighted** — the biggest thing in the record by power and inaudible.
   Anything about balance goes through the A-weighted and leave-one-out columns
   of `probe_stems.js`, not the plain RMS.

### When a check goes red, decide honestly which is wrong

Three times on 2026-08-07 a check went red because the check's PREMISE was
stale, not the program: the polymetre check inferred a period per lane and
phrasing destroyed that inference; the syncopation check held every bar to a
downbeat kick including the one bar whose job is to remove it; a new check
asserted repetition genres have identical bars, which they never did. Each was
rewritten to measure the thing it was actually about — reading the genre's own
`kit.poly` declaration, exempting D bars **by name** from
`materials.drumPhrase` — and **not** by moving a threshold. A check you rewrite
whenever it is inconvenient is not a check. Say in the commit message which you
changed and why.

### If you change the music on purpose

Rewrite the snapshot baseline in the same commit, say so in the message, and
say how many songs moved and which parts. Diff the old and new snapshot per
genre before overwriting — the baseline is regenerated on every commit, so it
only ever catches change you did not intend, and only if you look.

### Touching the SOUND

The graph, a voice, a genre's `space` or `kick`, the master chain:

```bash
node harness/probe_render_determinism.js      # every genre repeatable
node harness/probe_stems.js <genre> <seed>    # levels, A-weighted, leave-one-out
node harness/render_audio.js /tmp/aud 1,2
python3 harness/test_audio.py /tmp/aud        # 313 passed, 18 FAILED
```

**About those 18 failures.** Eleven are one check whose ceiling was calibrated
before the program had a stereo stage — it now fails a correct mix. The other
seven are four `presence above 2 kHz`, two `both channels carry the mix` and
one `solo tape`. All 18 were confirmed identical on the commit before, so none
belongs to the newest build — but **the count grew from 15 to 18 somewhere in
`04a`…`05d` and nobody has attributed it to a build.** `BACKLOG.md` §1 has the
numbers. **Do not just raise the number**: that check's value is failing when
the reverb vanishes, and a ceiling chosen to make today's mix pass proves
nothing. And do not inherit the habit that produced it — this battery once sat
at 8 failures filed as "pre-existing", and two were real defects in the music.

## What to do next

**Read `docs/BACKLOG.md` §0 first, and take it seriously.** Almost none of
the last two weeks of work has been *judged* — the reverb, the whole
stereo build, the matrix mixer, the stage, the flanger, the DP/4, the snap,
the barberpole, and now the whole `2026-08-08` run: the tape machine, the
legato (which audibly changes bladerunner and synthwave), the bass unit's
accent and slide wiring (audibly changes five genres' bass), the bus
compressor (squeezes four genres by design), and the spring tank. All
measured. None heard. **`08h` does NOT join that pile** — it moves no note and
changes no untouched record (proved by A/B at −118.5 dB against a −118.6 dB
same-build floor); what it changes is what the desk's knobs SAY and whether
they work when a hand is on them. The sax is the standing proof that green metrics never
establish that something sounds good.

So unless the user directs otherwise: **do not stack more onto that pile.**
Ask them to play it, or help them play it — pick seeds, name what to play
for, get a verdict — and let the verdicts decide what gets built, fixed or
removed next. The rest of the backlog is ordered and waiting underneath.
