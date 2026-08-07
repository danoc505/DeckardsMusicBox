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
and is the same file. It is how the user listens.

---

## THE RULES

These are binding. Several were written after being broken.

**RULE ZERO — ON PICKUP, RUN NOTHING.** Starting a session is not working.
Read, orient, take a job from `docs/BACKLOG.md`, start it. **Do not run the
seam battery or any probe to "establish a baseline."** The baseline is written
in these files, and a battery is a *difference* instrument — with nothing
changed there is no difference to find, so it cannot return anything you did
not already have. It is a diff against a file you know is identical. This cost
a session two `mk2_test` runs on an untouched program on 2026-08-07, the second
killed by the container for memory, and the instruction that caused it was
real: three copies of "run all of these before you claim anything" had survived
in `HANDOFF-MK2.md` for a week after the rule replaced them. **The one thing
worth running on pickup is `node harness/mk2_stamp.js check`** — one second, and
it is the only check that can genuinely come back false before you have done
anything.

**RULE ONE — print the notes and read them, every time.**
`node harness/mk2_roll.js 1 --genre <g>`, before and after any change, side by
side. `--genre` is a flag; a bare genre name silently composes lofi. This is a
test *in addition to* every other one, never instead of one.

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
  `[corpus:…]`, `[theory]`, `[EAR]`, `[GUESS]`.
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

Everything is `node harness/<name>.js`. The ones that matter most:

| | what it answers | cost |
|---|---|---|
| `mk2_roll.js <seed> --genre <g>` | **what the song actually is.** `--dump`/`--vs` compare two songs by bar and step | instant |
| `mk2_test.js` | the seam checks — tables, contracts, provenance | ~1 min |
| `mk2_snapshot.js check harness/mk2_baseline.snap` | 2100 songs' notes against a baseline: *did I change the music by accident* | ~10 min |
| `mk2_ui.js` | the real page in Chromium (flaky ~1 in 5; rerun and report both) | ~2 min |
| `probe_rack.js <machine>` | **one machine, five questions**: drawn, audible, isolated, switching, automated | ~3 min |
| `probe_pads.js` | the pad bay: wiring, geometry, crosstalk, HOLD, audibility per genre | ~2 min |
| `probe_controls.js [machine]` | every knob against the sound | ~9 min |
| `probe_busedge.js` | every hard step in every motion plan, and whether it lands | ~1 min |
| `probe_barber.js` | the barberpole, isolated as a difference signal | ~4 min |

**Run browser probes one at a time.** Four cores; four Chromium renders at
once finish slower than four in a row, and once finished none of them.

**A probe that is wrong reports a defect that is not there.** Every measurement
in this project that failed, failed in that direction. Before believing a
finding: was the machine actually in the slot, was the motion plan passed, was
the element on screen, was the window long enough, is the baseline the values
that were there or the ones that were declared.

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
mechanism behind a "listening session" that does not exist, and the user's
correction was blunt: *"What is a listening session? You can't hear. I can
always open the artifact and press play."*

`test/ears/LOG.md` holds the taste questions actually sent, and is a list, not
a gate.

---

## THE DOCUMENT MAP

- `docs/HANDOFF-MK2.md` — the long history, the laws, §8a the last session
- `docs/BACKLOG.md` — everything open, with the measurement that found it
- `docs/genre-research/*.md` — seven genres and the units. **Every web search
  goes in here.** A finding argued only in a commit message will be re-searched
- `test/ears/LOG.md` — taste questions and the user's verdicts
- `harness/README.md` — what each probe is for
