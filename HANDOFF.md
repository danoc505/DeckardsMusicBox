# Handoff

`README.md` says what the program is. This says how it is worked on and where
it has got to.

## What we are doing

The program makes records, and the whole difficulty is that a record can only
be judged by ear. Nothing here asserts one — the suite can be entirely green on
a program that writes confetti. So the work is always the same shape: find
something the program does badly, find a published account of how music
actually does it, build the smallest rule that follows, and measure whether it
changed anything.

## How you test, and which test for what

**Anything that changes notes, or who plays when — the piano roll.**

    npm run roll <genre> <seed>     the record as a picture, about a second
    npm run shot <genre> <seed>     the same record through the built page

Roll the thing you are about to change, then roll it again after. It is the
only way to see whether a section is a return, whether a part ever rests,
whether the tune went anywhere. Look at the PNG before you say anything about
it. `docs/THE-PIANO-ROLL.md` is how to read one.

**Anything that changes the desk — the WAV, played.** Treatments move effects,
not notes, so a record with and without them draws the SAME roll. The roll
cannot see the desk and will tell you nothing changed when something did.

    node src/cli.ts <genre> <seed> --wav out.wav

**Counting — `tools/measure.ts`.** How a line moves, who plays which bar, the
same over twenty seeds. That is how the research below was measured and no
picture can do it. The character grid it draws is not a piano roll.

`npm test` and `npm run check` are preconditions, not proof: green means no
stated law was broken, not that the result is music.

## The research

Every rule in this program comes from a document, and each has the same shape:
the research, then what went into the program, then what it came to when
measured. Write the next one that way.

| `docs/` | what it settles |
|---|---|
| `THE-PIANO-ROLL.md` | how to read a roll, and what to look for in what order |
| `TALLY.md` | what is done, what is open, and what closes each open item |
| `genre-research/MELODY-AND-THE-HOOK.md` | the tune: a figure that comes back, the contour it walks, the one wide leap |
| `genre-research/THE-INTRO.md` | how a record opens — three ways in — and the break. §7 is the worked example of a rule deleted for doing nothing |
| `genre-research/THE-ARRANGEMENT-AS-STORY.md` | who plays when, and why that is a narrative rather than a texture |
| `genre-research/THE-ALTERATIONS.md` | every way to restate something without rewriting it |
| `genre-research/DUNGEON-SYNTH-ARRANGEMENT.md` | what the genre says about its own middle |

## What was just done, and why

Two lines of work, both now on this branch.

**Treatments — the desk moves instead of the notes.** When an idea came round a
third time the old code varied its notes, which made a third of every record
unique and unmemorable: heard once, never again. The rule-of-three demand now
travels to the arrangement instead. An idea that will not return is marked
`recast`, and the arrangement moves the desk — darken, drench, wear, far and
eight others — leaving every pitch alone. Variants heard once fell 33% → 0%.
Desk changes land on their exact sample, so a record is byte-identical whether
rendered in 577-sample or 4096-sample blocks.

**The arrangement got a memory.** It chose who played in a section by walking a
list the genre wrote before the record existed — same names, same order, every
section of every seed. A list has no memory, so nothing that happened in a
record could affect it, and a rank that cannot change as a consequence is not a
story (Almén). Measured, that gave two opposite failures of the one missing
idea: lofi's opening part played 91% of the record and was never gone more than
three bars, so nothing ever happened to it, while dungeon synth abandoned its
opener outright in a quarter of records. It now picks the part the record can
most spare, out of what has actually happened; the genre's `shed` order
survives as a weight rather than an order. Parts stopped being abandoned — gone
for good fell from 15% and 25% to 5% in both genres.

## What needs doing

**1. Nobody has listened yet.** Every claim about the treatments is a
measurement, not a hearing. Does a cutoff moving 3600 → 1620 Hz in one sample
*click*? Is a third of spans on a treated desk right, or too much? Do the
changes land as musical events or as faults? Play seeds 1–10, 42 and 829055,
and write what you hear into `TALLY.md` §0. Nothing else on this list matters
as much.

**2. `THE-ARRANGEMENT-AS-STORY.md` §8 cites numbers this repository cannot
reproduce.** They were measured with a script that is not here — the only
unverifiable claim in these docs, and it undermines the rest of them. Give
`measure.ts` a mode that reports what becomes of a part across a sweep: its
share, its longest absence, whether it plays at the end, whether the
most-present part changes between halves.

**3. ~~lofi's hierarchy does not move.~~ DONE — and the diagnosis in this
entry was wrong.** It read "its drums sit at the bottom of its OWN shed order".
They did not: lofi stated no shed order at all, and inherited the pop default
`drone, keys, lead, bass, drums` — so the genre that ENTERS on its keys shed
its foundation second and its beat never. `affords()` is the only voice a genre
has in who leaves, and it gave lofi's drums 0.2, the minimum, in both the
section walk and the span score; at span level `hold-back` (the drums thinned)
is priced at 1 against `part-out` (the drums gone) at 0.2, so the stage could
only ever take the hat. Measured over forty seeds: the drums were heard in 100%
of bars, in 40 records out of 40, and were never once absent for a single bar.

lofi now states `shed: ["drone", "lead", "drums", "bass", "keys"]` with its
sources. Drums 100% → 78% of bars, longest absence 0 → 10 bars, never-absent
40/40 → 4/40; the most-present part changes between the halves of a record in
21 seeds of 40 where it changed in none. The same fault dungeon synth found in
the same default, with the parts swapped — so no new term was needed, only the
genre saying the sentence `spec.ts` already says is its to say.

The lesson worth keeping: this entry sent a reader into `arrange.ts` looking to
build "a term that knows about RANK rather than presence", when the genre-voice
term was already there and had simply never been given a value. A doc that
mis-states where a number comes from costs more than a missing doc.

**4. Two genre proposals, both one line, both sourced.** `introSec: 64` and
`fewest: 1` at the outro — see `DUNGEON-SYNTH-ARRANGEMENT.md` §8 and
`TALLY.md` §2. Both change how every dungeon synth record opens and closes, so
they are the owner's call.

**5. The absence ceiling has no number and may not need one.** The `1/(1+out)`
term in the section decision is a soft ceiling and it did the work alone.
Whether a stated number adds anything has never been tested. Test it on and
off; if it does nothing, delete it and keep the note.

**THE ALTERATIONS ARE NOW A PLAN, NOT A LIST.** The owner has asked for all 65
built and all 65 available. `docs/BUILDING-THE-ALTERATIONS.md` is the plan —
six phases, what each delivers, what number says it worked, and what could make
it wrong. Items 6 and 7 below are Phase 2 and Phase 5.1 of it. **Read that doc
before starting either**: the pool cannot safely grow until the span score
prices a move's KIND and a genre's LAYER (Phase 1), and that is a hard blocker,
not a caveat.

**6. Ten alterations are still static** — azimuth, pedal swap, patch, medium,
modulation, kit and circuit swap, lane controls. Each is a `SoundSpec` leaf and
the plumbing is already built.

**7. Partial variation**, which `THE-ALTERATIONS.md` calls the most useful kind
for a generator: first half identical, second half diverges. Only whole-line
variation exists. That belongs in the material stage, not the arrangement.

## House rules that are easy to break

- **A knob that does nothing is this program's cardinal sin.** If a rule is
  built, measure it on and off. If it changes nothing, delete the field and
  keep the note saying it was tried — `THE-INTRO.md` §7 is the worked example.
- **Every number a genre states carries its source** in that genre's `sources`
  map. A number with no published source says `[chosen]`. Do not invent a
  citation, and do not cite a page you have not read.
- **The comment is the specification.** Where a doc comment and the code
  disagree, that is a defect to report, not prose to skim past.
- **Rules are written in beats** and resolved against the genre's own metre, so
  a genre in five four needs no new code.
- **Recast is the pivot.** `form.ts` marks an idea that will not return; the
  arrangement opens that span with a treatment rather than a density move. If
  you change the rule of three or the form grammar, retest that path.
- The pipeline is five pure stages, each frozen on the way out. Selection
  happens in the arrangement, before a note exists; the material stage builds
  only what the arrangement will have heard.

## Do not

- Do not commit generated rolls, shots, dumps or WAVs — they are reproducible
  from the program and the seed, and `.gitignore` already covers them.
- Do not change behaviour to make a test pass. The tests encode research; if
  one is wrong, the doc it came from is what has to change first.
- Do not judge a treatment by the piano roll. It cannot see the desk.

## Commands

| | |
|---|---|
| the record as a picture | `npm run roll <genre> <seed>` |
| the same, through the built page | `npm run shot <genre> <seed>` |
| the record as sound | `node src/cli.ts <genre> <seed> --wav out.wav` |
| the record as text | `node src/cli.ts <genre> <seed>` |
| who plays which bar | `node tools/measure.ts <genre> <seed> --map` |
| the same over twenty seeds | `node tools/measure.ts --sweep <genre> 1 20 --map` |
| every test, then types | `npm test` · `npm run check` |
| the single file | `npm run build` |
