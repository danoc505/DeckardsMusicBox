# START HERE — the prompt for whoever picks this up next

*Everything below is verified at `2026-08-06a` (the note's scaffolding) unless it says otherwise. If you
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
(`Deckards Orchestrator MK2.html`, ~17k lines) that generates music in seven
genres through a six-stage pipeline. No build step, no dependencies, no
server. Open it in a browser and it plays.

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

**THE STAMP AND THE ARTIFACT MOVE TOGETHER.** The program the user listens
to is the published artifact, not the repo. Once it was three commits behind
while both files carried an identical stamp, so three commits of work went
unheard. Bump the stamp in the HTML, run `node harness/mk2_stamp.js write`,
and republish **the same artifact URL**:
`https://claude.ai/code/artifact/b7004a11-15b7-4e76-be6e-dd39bb86ed06`.
Current: `build 2026-08-06a`.

**THE SAX IS PARKED.** The user's verdict, after every metric on it came
back green. Do not un-park it without the terms in the handoff's warning
block. Same precedent applies to the Random Hall reverb, which ships OFF
because the measurement refused it.

**No pull request unless the user asks for one.**

## Where the program stands

Run these before you claim anything. Numbers measured at `2026-08-06a`.

```bash
npm install playwright           # FIRST, on a fresh clone: node_modules is not
                                 # in the repo and the four browser probes below
                                 # die with "Cannot find module 'playwright'",
                                 # which reads like a broken probe and is not.
                                 # Do NOT run `playwright install` — the browser
                                 # is already in the image.
node harness/mk2_test.js         # 123 seam checks, expect 123 / 0
node harness/mk2_ui.js           # 34, real browser
node harness/mk2_blend.js        # 10, and 504/504 blended pairs
node harness/mk2_midi.js         # 20 (flakes on wall-clock under load)
node harness/mk2_snapshot.js check harness/mk2_baseline.snap   # IDENTICAL
node harness/probe_voices.js     # 0 threw, 0 silent
```

Touching the SOUND (the graph, a voice, a genre's `space` or `kick`, the
master chain) also means:

```bash
node harness/render_audio.js /tmp/aud 1,2
python3 harness/test_audio.py /tmp/aud        # 313 passed, 18 FAILED
node harness/probe_render_determinism.js      # all seven repeatable
node harness/probe_wiring.js                  # who reaches what
node harness/probe_matrix.js <genre>          # every crossing moves air. ~20 min A GENRE
```

**About those 18 failures.** Eleven are one check whose ceiling was
calibrated before the program had a stereo stage — it now fails a correct
mix. The other seven are four `presence above 2 kHz`, two `both channels
carry the mix` and one `solo tape`. All 18 were confirmed identical on the
commit before, rendered in a separate worktree with the same seeds, so none
belongs to the newest build — but **the count grew from 15 to 18 somewhere in
`04a`…`05d` and nobody has attributed it to a build.** That bisect is the open
job; `BACKLOG.md` §1 has it with the numbers. **Do not just raise the number**: that check's value is
failing when the reverb vanishes, and a ceiling chosen to make today's mix
pass proves nothing. And do not inherit the habit that produced it — this
battery once sat at 8 failures filed as "pre-existing", and two of them were
real defects in the music.

**If you change the music on purpose**, rewrite the snapshot baseline in the
same commit, say so in the message, and say how many songs moved and which
parts of them. The last change to move notes was measured both ways: 91 of
2100 seeds by hash, 7 of 2100 songs by actual played events, all of them the
second keyboard's pad.

## What to do next

**Read `docs/BACKLOG.md` §0 first, and take it seriously.** Almost none of
the last two weeks of work has been *listened to* — the reverb, the whole
stereo build, the matrix mixer, the stage, the flanger, the DP/4, the snap,
the barberpole. All measured. None heard. The sax is the standing proof that
green metrics never establish that something sounds good.

So unless the user directs otherwise: **do not stack more onto that pile.**
Ask them to play it, or help them play it — pick seeds, name what to listen
for, get a verdict — and let the verdicts decide what gets built, fixed or
removed next. The rest of the backlog is ordered and waiting underneath.
