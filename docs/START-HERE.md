# START HERE

Everything binding is in this file. It is short on purpose.

---

## THE BRANCH

`claude/orchestrator-mk2-handoff-e8475j`. All work goes here.

```bash
git fetch origin claude/orchestrator-mk2-handoff-e8475j
git checkout claude/orchestrator-mk2-handoff-e8475j
```

Commit and push as you go.

---

## THE PROGRAM

**Deckard's Orchestrator MK2** — one self-contained HTML file,
`Deckards Orchestrator MK2.html`. No build step, no dependencies, no server.
Open it in a browser and it plays. It composes whole songs from a seed.

It is published to a page with a **16 MiB ceiling**, and most of the file is
sample banks, so a new sampled instrument is costed before it is fetched.

**Nothing about the program is listed in this file — ask the program.** Genres,
modes, instruments, roles: they are in the code, and a list written down here
is a copy that goes stale.

```sh
node -e 'const fs=require("fs");const s=fs.readFileSync("Deckards Orchestrator MK2.html","utf8").split("<script>")[1].split("</script>")[0];global.window={addEventListener(){},MK2:null};global.document={getElementById:()=>({addEventListener(){},textContent:"",value:"1",innerHTML:""}),createElement:()=>({click(){}})};eval(s);console.log(window.MK2.genres().join(" "))'
```

### The pipeline

`MK2.composeSong(seed, rig, genre, picks, pins, edits, traitRoll, traits, wantSec)`
returns `{ chart, form, materials, sections, perf, motion }`, built in six
stages:

| stage | makes | what it decides |
|---|---|---|
| 1 | `chart` | seed, genre, root, mode, tempo, metre table, length |
| 2 | `form`  | the sections: what each one is, where it starts, where it ends |
| 3 | `materials` | the tunes and chords themselves — A, B, C, their variants, fills, endings |
| 4 | `sections` | the arrangement: which parts play in each section, at what energy, on which machines |
| 5 | `perf` | grid to seconds — the actual notes, as timed events |
| 6 | sound | voices, mixer, output |

A performance event is `{ tSec, durSec, pitch, voice, role, lane, gain }`.
The clock (`MK2.makeClock(chart, form)`) owns the conversion between bars and
seconds, in both directions. Nothing else may do that arithmetic.

---

## THE LAWS

### 1. Music theory is the ground.

Every musical decision answers to music theory and to the research in
`docs/genre-research/`. That is the ground the program stands on. A number that
came from taste is allowed, but it is labelled as taste and it is not dressed
up as a finding. When theory and a guess disagree, theory wins.

### 2. There are hard laws and there are soft laws.

**A hard law is what a thing IS.** Break it and the thing is no longer itself.
An intro is at the start of the song — that is hard. A chorus recurs — that is
hard. The bass is the lowest sounding part — that is hard. Hard laws are
enforced in the code and it is correct for the program to refuse to violate
one.

**A soft law is how a thing usually goes.** Most intros are quiet. Most
choruses lift. A soft law is a strong default that any genre, section, or seed
may argue its way out of, and the program should be able to break one on
purpose and still be right.

Know which kind you are writing before you write it. Enforcing a soft law makes
every song the same. Leaving a hard law unenforced makes the form meaningless.

### 3. Constraints, not baked-in values.

**What the intro IS is not hard — only that it comes first.** So the program
should say *where an intro may sit and what it must satisfy*, and let the
material be drawn inside that. It should not hold a stored answer for what an
intro sounds like.

Write the rule, not the result. A range, a relationship, a floor, a ceiling, an
ordering — those travel across genres and seeds and produce different music
every time. A fixed number produces the same music forever and has to be
re-tuned by hand for every genre that wants something else.

When you are about to write a literal into a table, ask what constraint that
number is standing in for, and write that instead.

### 4. The printout is the prime test.

```sh
node harness/mk2_roll.js                # the whole song, drawn, as a piano roll
node harness/mk2_score.js               # the whole song, exact, as notes
```

**This is how you check your work and how you prove it.** Print before the
change, print after, and read both. Not the summary at the top — the bars.

`mk2_roll.js` writes an HTML file. Open it: the whole record on one page, pitch
up the page and time across it, one colour a part, the kit in its own band
underneath, the sections named along the top. It is the view that shows what the
parts do to each other — a register two of them are fighting over, an empty
octave, a part that stops and never comes back, a hole where everything stops at
once. Hover a note to name it; click a part in the key to take it out.

The note list is the exact figures: every note as `NAME@step:length`, and how
many milliseconds it sits off its step. Use the roll to see the shape and the
list to read the detail.

**A change that was meant to move the music and did not move it has not been
made.** If you touched a genre table, a stage, a material, or a voice's notes
and the printout comes back identical, the honest report is "not applied" — not
"safe". Byte-identity is a result exactly once: proving a new mechanism is
inert while it is still switched off, in the same build that switches it on.

**A default that no genre ever overrides is a fix that was never made.** If it
is a fix, ship it on.

If what you touched cannot move a note — a label, a colour, a panel — say so in
one sentence and print nothing.

---

## WHAT IS BEING BUILT

`docs/MELODIC-MATH-ENGINE.md` — the law that lets a line generator be set free
without it making noise. It governs any line the program writes: the lead, the
bass, the counter, the repeating figure. Five things that must be true for a line to be a
tune; everything else is a dial the genre declares as a range and the seed draws
inside. Designed from the owner's eight sheets and from three complete songs
measured note by note. The research behind it is
`docs/genre-research/melodic-math.md`. It is the next build, in phases, each one
moving notes on its own.

---

## PLAIN ENGLISH

The person this is built for is not a musician and not an engineer. Write
everything — replies, commits, docs, comments, and the words on screen — so
they can read it.

- Say what a thing does, not what it is called. "The pad plays in every bar and
  never stops", not "the harmonic-filler layer is doubled".
- If a technical word is unavoidable, explain it in the same sentence.
- Short sentences, one idea each.
- Numbers are welcome. A number is not jargon.

---

## THE HARNESS

Derived from `ls harness/*.js`, never remembered:

```
node harness/mk2_roll.js                THE TEST. The whole record, drawn, on
                                        one page. Writes roll.html.
node harness/mk2_score.js               the same song as notes, bar by bar
node harness/mk2_score.js --mid out/    write real .mid files
node harness/mk2_syntax.js              does the file still parse
node harness/mk2_stamp.js check         is the artifact this build
node harness/mk2_cost.js                what a change costs in tokens
node harness/mk2_render.js              offline audio, for listening
node harness/render_audio.js <dir> <seeds>   render it and listen
```

Useful flags on the printout: `--genre <g>`, `--seed <n>`, `--seeds 1,7,42`,
`--from <bar> --to <bar>`, `--picks lead=sax`, `--trait kit=synthwave`,
`--blend lofi:50,synthwave:50`, `--len 2:00`.

---

## THIS FILE

It says what the program is and what binds you. It is not a place to record
mistakes. A post-mortem written into an instruction file teaches the mistake to
whoever reads it next, and it buries the instruction under history. Fix the
thing, say so in the commit message, and leave this file describing the program
as it now stands.

Git has the history. This file has the present.
