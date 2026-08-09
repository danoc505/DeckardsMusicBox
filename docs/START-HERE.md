# START HERE — the prompt for whoever picks this up next

*Everything below is verified at `2026-08-09b` unless it says otherwise. If you
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
words: *"use what we have and you find more — always"*, and *"you have no
ears, this data is the only way to improve the program"*. Mark anything you
chose rather than sourced as `[EAR]`.

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

**THE STAMP AND THE ARTIFACT MOVE TOGETHER.** The program the user listens
to is the published artifact, not the repo. Once it was three commits behind
while both files carried an identical stamp, so three commits of work went
unheard. Bump the stamp in the HTML, run `node harness/mk2_stamp.js write`,
and republish **the same artifact URL**:
`https://claude.ai/code/artifact/b7004a11-15b7-4e76-be6e-dd39bb86ed06`.
Current: `build 2026-08-09b`. **And read the stamp back off the LIVE PAGE
afterwards** — `mk2_stamp.js check` compares the build to a RECORD of what was
published, which is not the same claim as the page agreeing with either.

**THE SAX IS PARKED.** The user's verdict, after every metric on it came
back green. Do not un-park it without the terms in the handoff's warning
block. Same precedent applies to the Random Hall reverb, which ships OFF
because the measurement refused it.

**No pull request unless the user asks for one.**

## What happened last, and what to do next

**Build `2026-08-09b` — the drums now change from section to section.** The
largest open item in `BACKLOG.md` (§6.0 A) is built. A record had six to fourteen
sections with drums in it and three or four drum parts; four genres closed on a
drum part the listener had already heard, in 100% of songs. A section's drums are
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
beside it. **It has not been heard.** Brief: `test/ears/LOG.md`.

**Build `2026-08-08s` and before.** The 2026-08-08 run did five theory gaps and then grew
the roll a pair of hands. `HANDOFF-MK2.md` has every build in detail; the short
version, and the two things that matter most for whoever is next:

- `08n` the record can change key mid-song · `08o` the second voice answers the
  tune instead of shadowing it · `08p` two copies of one movement, one slightly
  slower (phasing) · `08q` the bass moves again — **reversed by ear at `08r`** ·
  `08r` the fills come back (they were locked behind a chorus and firing once
  every 933 bars in minimal techno) · `08s` **the hand on the roll**: click a
  note, get that part in that section, reroll / thin / thicken / octave /
  reverse / delete it, and undo.

**THE FIRST THING TO KNOW: nothing in that list has been heard.** Every entry
ends with the same sentence in the HANDOFF. The owner is the only ear and the
backlog of unheard changes is now the single biggest risk in this project — a
tenth measured-but-unheard build is worth less than one listened-to one.

**THE SECOND: the owner reversed me twice in this run**, and both times the
answer was already written down. Read `docs/genre-research/NOTES-FROM-THE-USER.md`
from the bottom before you design anything. In particular: *"we can't always
have no changes, how can we make anything better if nothing ever changes?"* —
"0 of 300 seeds moved" is a SAFETY check, not a score, and reporting it as an
achievement is a habit to break.

**⚠ THE DRUM SECTIONAL ARC IS BUILT — `2026-08-09a`. Do not start it again.**
`BACKLOG.md` §6.0 A is closed; A1–A5 under it are what is left of that item, and
none of them is the mechanism.

**What is open, and what the owner asked for last, is `BACKLOG.md` §H — THE
GENRE FADERS.** They call the faders *"our chief rule breaking tool"* and say
they are *"quite blind and limited… it seems to bake in certain aspect negating
others."* Measured: a 50/50 fader averages ~47/53 across songs and produces
individual records from **10/90 to 50/50**. Step 1 of six is built (`b7950cf`);
**step 2 is the quota allocator** and its gate is that a solo genre must stay
byte-identical. The whole brief is §H.

**⚠ AND THE STAMP IS RED ON PICKUP, EXPECTED.** `b7950cf` changed the file and
nothing has been republished since `2026-08-09b`. That is work in progress, not
the artifact drift the check exists for. Decide early whether to publish; do not
leave it red for a whole session.

## The commands

Build `2026-08-09b`. The commands, each in the DEFAULT form, which is the form
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
node harness/probe_drumarc.js               does the drum part have a SHAPE
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
the last two weeks of work has been *listened to* — the reverb, the whole
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
Ask them to play it, or help them play it — pick seeds, name what to listen
for, get a verdict — and let the verdicts decide what gets built, fixed or
removed next. The rest of the backlog is ordered and waiting underneath.
