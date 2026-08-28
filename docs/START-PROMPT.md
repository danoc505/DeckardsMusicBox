# THE STARTING PROMPT

*Paste this into a fresh session. Rewritten 2026-08-05 at build `2026-08-05d`,
replacing the version written at build `2026-08-04j`. It says what the program
is, the rules that bind whoever works on it, and where things stand. It
deliberately does not assign a next job.*

---

## THE PROGRAM

**Deckard's Orchestrator MK2** — one self-contained HTML file, about 6.1 MB,
that composes and plays complete generative songs through a six-stage
pipeline. No build step, no dependencies, no server: open the file and press
play. Personal. Not for sale, not distributed.

**How many genres there are is not written here on purpose. Ask the program:**

```sh
node -e 'const fs=require("fs");const s=fs.readFileSync("Deckards Orchestrator MK2.html","utf8").split("<script>")[1].split("</script>")[0];global.window={addEventListener(){},MK2:null};global.document={getElementById:()=>({addEventListener(){},textContent:"",value:"1",innerHTML:""}),createElement:()=>({click(){}})};eval(s);console.log(window.MK2.genres().join(" "))'
```

The previous version of this paragraph named seven and listed them. It was
wrong on 2026-08-07 — there are **eight**; `dungeonsynth` had shipped and no
document said so. That is the DERIVE, NEVER LIST rule failing inside the
sentence that states the rule, which is exactly how it always fails.

**The artifact** lives at
`https://claude.ai/code/artifact/b7004a11-15b7-4e76-be6e-dd39bb86ed06`
and is the same file. It is how the user answers.

---

## THE RULES

These are binding. Several were written after being broken.

**RULE ZERO — ON PICKUP, RUN NOTHING EXCEPT THE PRINTOUT.** Starting a session
is not working. Read, orient, take a job from `docs/BACKLOG.md`, start it.
**Do not run anything to "establish a baseline" beyond the printout you are
about to compare against.** `node harness/mk2_score.js --genre <g> --seed <n>`
saved to a file IS the baseline, and it is the one you will diff. Nothing else
is worth running on pickup except `node harness/mk2_stamp.js check` — one
second, and the only check that can genuinely come back false before you have
done anything.

**RULE ONE — PRINT THE MIDI OF THE WHOLE SONG, ALL INSTRUMENTS, AND READ THE
WHOLE THING. IT IS THE ONLY TEST.**

```sh
node harness/mk2_score.js --genre <g> --seed <n>
```

Before the change and after, side by side, and **read it** — not the summary
line, the bars. `mk2_roll.js`, `mk2_test.js`, `mk2_snapshot.js`, `mk2_blend.js`
and the 87 probes named elsewhere in these documents **do not exist**; they were
deleted on 2026-08-18 and any instruction to run them is stale.

> **The owner, 2026-08-28:** *"The ONLY ONLY ONLY TEST IS PRINTING MIDI OF WHOLE
> SONG ALL INSTRUMENTS AND READING THE WHOLE SONG."*

**RULE ONE-A — A CHANGE THAT LEAVES THE MUSIC BYTE-IDENTICAL HAS NOT BEEN MADE.**

This is the rule that had to be written, and it is written because the opposite
was being practised. From the owner, on a build that added two mechanisms and
then proved ten records printed unchanged:

> *"Why are you concerned if everything stays the same when you're supposedly
> CHANGING the way everything is? Something in your instructions is making you
> make changes that DO NOTHING and then you prove they done nothing by testing
> that they have not changed anything! This is WRONG WRONG WRONG."*

**A test whose passing condition is that the music did not move is a test that
the fix was not applied.** Byte-identity has exactly one legitimate use: proving
a new mechanism is INERT while it is still switched off, as one step before you
switch it on in the same build. It is never a result, never a finish line, and
never evidence that work was done. If a session ends with the notes unchanged,
the session shipped nothing — say so in those words rather than dressing the
snapshot up as a pass.

**RULE ONE-B — A DEFAULT THAT NO GENRE OVERRIDES IS A FIX THAT WAS NEVER MADE.**

The corollary, and it has cost this program real music. `theme.noRepeat` gated
the fix for a defect the owner reported **six times**; no genre ever declared
it, so for its whole life the flag was off, the defect was at 8–13% of the
lead's notes, and **the code behind the flag contained a ReferenceError that had
never once executed.** Nothing caught it, because the test being run was "did
the music stay the same," and it did.

So, before you put a number in a table:

- **Is this a TASTE or is it what the thing IS?** An interval budget is a taste
  and defaults to the old value. A note having a *length* is not a taste — it is
  what a melody is — so it defaults to the fix and a genre may argue downward.
- **If it is a fix, ship it ON, in the same build, and print the notes.** "A
  genre that declares nothing draws what it always drew" exists so you cannot
  break music nobody measured. It is not a licence to ship every fix switched
  off and pass a test for having done so.
- **If you leave a switch off, say in the commit that the fix is not yet
  applied.** Not "byte-identical, safe." Not applied.

**Research every genre or unit you touch, fresh, in its own doc with named
sources.** Prior research does not count on its own — use it and add to it
from the internet. **But if the research is already there and the thing is
already built, wire them together instead of asking permission.**

**Derive, never list.** Anything that writes out what the program contains
goes stale. This has now happened often enough to be a law rather than a
caution: a hand-written list of controls, of chain letters, of effect columns,
of kit names, of genres. If a probe or a check needs to know what the program
contains, it asks the program.

**Derive the set, never the words.** The other half, learned the hard way:
deriving the drum rack's loadable list from the voice table put thirty-four
variable names on a front panel — `erangDrum`, `psgOpenhat`, `oh808`, `brk`.
A key is how the program refers to itself and the user is not a programmer.
Derive the SET; keep the WORDS in a table; put a seam check on the derived set
so an unnamed one fails the battery instead of reaching the glass.

**The stamp and the artifact move together.** Bump the stamp in the HTML, run
`node harness/mk2_stamp.js write`, republish the artifact. A page and a repo
carrying one stamp between two different programs is a defect the battery
checks for.

**Music theory is the physics engine.** Decisions about the laws are the
coder's to make and to write down, not to hand back.

**The sax stays parked. No pull request unless asked.**

**Talk plainly.** The user is not a musician and has rejected jargon and
metaphor repeatedly. Say what a change does to what you would hear.

**Report what happened, not what was hoped.** The expensive history of this
project is confident "fixed" claims that were false. If a measurement
contradicts something already said — including something already pushed —
say so plainly and correct it.

**A knob that does nothing is a lie, and so is a knob that is drawn and never
read, and so is a label that says the wrong thing.** All three have been found
here.

**THE USER IS THE END OF THE LINE.** *"If I turn a knob it should always work
for me no matter what the genre is."* A control the hand can reach must do
something on every genre. Where the genre's own routing would leave a unit
unfed, the hand opens it.

**Branch discipline: develop and push only on `claude/code-review-6jd9cz`.**
Commits authored `Claude <noreply@anthropic.com>`. Never commit downloaded
corpora — `corpus/` stays local. **Commit and push early**: the container has
rolled the clone back mid-task more than once.

---

## HOW THE PROGRAM IS BUILT

Six stages — CHART, FORM, MATERIALS, ARRANGEMENT, PERFORMANCE, SOUND — each
freezing its output. No correcting passes.

- **Law 4**: a genre is parameter tables only. No genre names in stages 2–5.
- **Determinism**: no `Math.random`; `stream(seed, "name")` substreams; draws
  execute unconditionally or later draws starve.
- **Seam checks throw, they do not warn.** Provenance marks in comments:
  `[corpus:…]`, `[theory]`, `[CHOSEN]`, `[GUESS]`.
- `composeSong(seed, RIG, genre, picks, pins)` — **genre is the third
  argument.** Passing it second composes lofi on that rig; the chart guard
  throws on the ambiguous two-argument form now, because that trap cost a
  build.
- Three owners of a control's value: the genre's `PARAMS`, the hand's `TRIM`
  offset on top, and the song's motion plan. A control is read either **per
  note** through `P()` or **as a curve** through `rideBus()` — those are the
  only two, and which applies is the control's declared `kind`.

---

## THE HARNESS

**⚠ THIS TABLE USED TO LIST NINE TOOLS AND SEVEN OF THEM DO NOT EXIST.**
`mk2_roll.js`, `mk2_test.js`, `mk2_snapshot.js`, `mk2_ui.js` and every
`probe_*.js` were deleted on 2026-08-18. An instruction to run them is not a
stale convenience — it is an instruction to go and find some other test than
the printout, which is the one thing RULE ONE forbids. This is the whole
harness, derived from `ls harness/*.js`:

| | what it answers | cost |
|---|---|---|
| `mk2_score.js [--genre g] [--seed n] [--mid out/]` | **THE TEST.** The whole song, every instrument, every bar, as notes — and real `.mid` files with `--mid` | seconds |
| `mk2_syntax.js` | does the file still parse | instant |
| `mk2_stamp.js check\|write` | is the published artifact the build in the file | instant |
| `mk2_cost.js` | the token cost of a change | instant |
| `mk2_render.js` · `render_audio.js` | offline audio, for listening rather than for testing | slow |

**A measurement that is wrong reports a defect that is not there.** Every
measurement in this project that failed, failed in that direction — and the
three worst were all the same shape: **an aggregate quoted instead of notes
read.** "22% of tunes" measured per material when the rule governs the phrase.
"82% against a declared `answer: 0.85`" measured against a field the file says
is never read. "The counter always looks the same" answered about the counter
when the row on the printout was the ostinato. **When a number surprises you,
print the bars and look at them before you believe it.**

---

## WHERE IT STANDS

Build `2026-08-07f`. Battery as recorded at that build: seam 131/0, ui 36/0,
blend 10/0, midi 20/0, mixer 4/0, snapshot `b9c88d17b7e7c54e`.

**Those numbers are a RECORD, not a task.** Do not re-run them to confirm them
on arrival — see RULE ZERO. `mk2_stamp.js check` is what tells you the file in
front of you is the one they were taken on, and it takes a second.

What the sessions of 2026-08-05 and 2026-08-07 did is recorded in
`docs/HANDOFF-MK2.md` §8a and the `07a`…`07f` block — a record of work, with
its retractions kept.

The open work is in `docs/BACKLOG.md`. Read §0 first: it means *do not stack
unverified taste guesses*, and it does **not** mean stop building what the
research justifies. A previous session parked a fully researched, ready
mechanism behind a "taste check" that does not exist, and the user's
correction was blunt: *"What is a taste check? You cannot judge sound. I can
always open the artifact and press play."*

the backlog holds the taste questions actually sent, and is a list, not
a gate.

---

## THE DOCUMENT MAP

- `docs/HANDOFF-MK2.md` — the long history, the laws, §8a the last session
- `docs/BACKLOG.md` — everything open, with the measurement that found it
- `docs/genre-research/*.md` — seven genres and the units. **Every web search
  goes in here.** A finding argued only in a commit message will be re-searched
- the backlog — taste questions and the user’s verdicts
- `harness/README.md` — what each probe is for
