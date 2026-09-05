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

**A treatment — `tools/treatments.ts`.** The one thing neither the roll nor
`measure.ts` can see: a treatment moves the desk and not one note, so the MIDI
is the same MIDI and the picture is the same picture. This renders the record
with its desk emptied and again held under each treatment, and reports how far
the record moved, in dB. It is how a dead knob is caught, and it does not tell
you whether anything sounds good.

    node tools/treatments.ts                     every genre, seed 2
    node tools/treatments.ts lofi 2,7 --sr 44100

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
| `genre-research/THE-STALENESS-CLOCK.md` | when a move must fire: the rule of three counted per part, and the drift that pays it |

## What was just done, and why

**The foundation under the treatments, because two of them were doing
nothing.** Twelve treatments were built, weighted by two genres, scored by the
arrangement and rendered, and the only thing holding any of it to its purpose
was one assertion that the record with its whole desk timeline differs from the
record with none — which passes while eleven of the twelve are dead. Asked one
at a time, two were. `render.ts` builds only what something feeds, and it knew
that in a private method; `treat.ts` compared the treatment's numbers against
the genre's numbers and called that "does it do anything". So dungeon synth was
offered `echoed`, a genre no part of which sends a drop to the echo: the move
turned two numbers and the record came back **bit-identical, −225 dB**. lofi
was offered `brighten` with its pole at `mix` 0, out of the sum: −37.7 dB, and
it held 6.3% of every lofi record — in six of the first eight seeds it was the
record's second treated span. `sound/reach.ts` now states the renderer's
liveness rule once, `deskOf` asks it, and `stage/treat.test.ts` renders every
treatment of every genre and measures it. Not a note moved: over 40 seeds a
genre, every event and every roster is identical.

And the desk tests were running at 8 kHz, where `Pole`'s `sampleRate / 6`
stability clamp pins dungeon synth's filter — so `darken`, this genre's own
headline move and 39% of its treated time, was **exactly a no-op in the test
that was supposed to prove the desk is heard**. Both moved to 22050 Hz.

Then two older lines of work, also on this branch.

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

There is now a ranked list to listen against — `node tools/treatments.ts`, and
the table in `THE-ALTERATIONS.md` — and it asks three questions in particular.
`wear`'s difference signal is LOUDER than the record it differs from (+3.3 dB
on dungeon synth, 18% of its treated time): is that a section ageing or a
different pressing? `dry` and `drench` move the LEVEL by ~2 dB, which is the
one thing a treatment was not supposed to do. And half of lofi's vocabulary
sits 17 dB below its own `darken` — if those are inaudible the fix is in
lofi's desk, which gives one part a pedal board and no pole at all, not in the
treatments.

**2. ~~`THE-ARRANGEMENT-AS-STORY.md` §8 cites numbers this repository cannot
reproduce.~~ DONE.** `node tools/measure.ts --sweep <genre> 1 20 --parts`
reports, per part, its share, its longest absence, whether it plays at the end,
and whether the most-present part changes between halves — read off the file
like the rest of that tool. And `tools/stale.ts` reads the composed record for
the thing the file cannot carry: how many turns a part plays identically before
anything about it changes. Both landed with `THE-STALENESS-CLOCK.md` Step 0.

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

**4. ~~Two genre proposals, both one line, both sourced.~~ BOTH APPLIED, and
neither ended up being the one line it looked like.** `introSec: 64` is now a
constraint rather than a number: `resolve.ts` refuses at load an intro length
that cannot fit under the genre's own ceiling at its own fastest tempo, and the
silent fallback in `form.ts` that used to take the shortest length whenever
nothing fitted is gone. `fewest: 1` at the outro is not a second value for
`fewest` at all — a floor is about a section that carries on, and the last one
does not, so the ending is floored by what the record OPENED with instead.
Numbers in `TALLY.md` §2.

**5. ~~The absence ceiling has no number and may not need one.~~ TESTED — and
there was never a ceiling.** Over 500 seeds a genre the absence distribution is
identical with the `1/(1+out)` term, without it, and with `share` dropped
instead: lofi median 8 / p90 20 / p99 32 / max 36 bars, dungeon synth 16 / 40 /
56 / 88. The term is not a soft ceiling; it is not a ceiling. It does move
abandonment — and `share` and it pull opposite ways, `share` carrying lofi and
the ceiling term carrying dungeon synth, with the product worse than the better
single term in both. Not deleted, because it does something; the claim it
carried is corrected in `arrange.ts` and in `THE-ARRANGEMENT-AS-STORY.md` §8.
What is still open is which combination is right, and that is a listening
question.

**THE ALTERATIONS ARE NOW A PLAN, NOT A LIST.** The owner has asked for all 65
built and all 65 available. `docs/BUILDING-THE-ALTERATIONS.md` is the plan —
six phases, what each delivers, what number says it worked, and what could make
it wrong. Items 6 and 7 below are Phase 2 and Phase 5.1 of it. **Read that doc
before starting either**: the pool cannot safely grow until the span score
prices a move's KIND and a genre's LAYER (Phase 1), and that is a hard blocker,
not a caveat.

**6. ~~Ten alterations are still static~~ BUILT — azimuth, pedal swap, patch,
medium, modulation, kit and circuit swap, lane controls.** `TREATMENTS` is 23,
and every one of the eleven added carries the line in `reaches` that says which
unit it arrives through. Measured by `treat.test.ts`, which renders each of
them on each genre: nothing was deleted, because everything offered clears the
floor. lofi is offered 20 of the 23 and dungeon synth 21. `recircuit` is
refused by both — neither genre runs the analogue kit, so there is no other
circuit for it to be — `brighten` by lofi, which has no pole in its sum, and
`echoed` by dungeon synth, which feeds no echo.

The rule that got them there still stands for the rest of the catalogue: add it
to `TREATMENTS`, give `reaches` the line that says which unit it arrives
through, and let `treat.test.ts` say whether it moved the record. A new leaf
that does not clear the floor is a leaf that gets deleted, not one that gets
shipped and measured later.

**6a. ~~lofi rotates rather than chooses.~~ DONE.** lofi now states its own
treatment weights from its own sources, and the even default it was running on
was never even: pool order alone decided a hard 54-to-1 ranking, taken from the
order of a `const` in `spec.ts` that no author chose. `TALLY.md` §2.

**6b. ~~THE POOL HAS NO CLOCK~~ BUILT — drift, and the rule of three counted per part.**
`genre-research/THE-STALENESS-CLOCK.md` is the spec; Phase 3.5 of the plan is
the build. Twenty-three alterations exist and nothing says when one has to
fire, so the record keeps the rule of three and every part breaks it: on ten
random records — and over two hundred, `node tools/stale.ts` — **42–43% of
keys and bass runs are three or more identical turns**, the worst sixteen turns — thirty-two bars of one two-note figure while
the arrangement changed eight times around it. In the same ten records the desk
timeline holds **0 to 7 entries**, one lofi record moving its desk not once in
52 bars. Both pieces are built and measured in `THE-STALENESS-CLOCK.md` §4:
dungeon synth's bass went 42% → 28% of runs past three and its longest run 16
→ 6 turns; the desk moves every 14–15 bars where it moved every 23; and a genre
now states `drift`, so a treatment walks to where it is going instead of
switching. What is left — `arrangement.unpaid`, two boundaries in five with
nothing composable left — is the price of the repetition law, and the case
for Phase 4 (a voice swap per span pays a debt without touching a note).

**7. Partial variation**, which `THE-ALTERATIONS.md` calls the most useful kind
for a generator: first half identical, second half diverges. Only whole-line
variation exists. That belongs in the material stage, not the arrangement.

## House rules that are easy to break

- **A knob that does nothing is this program's cardinal sin.** If a rule is
  built, measure it on and off. If it changes nothing, delete the field and
  keep the note saying it was tried — `THE-INTRO.md` §7 is the worked example.
- **And measure whether the RECORD changed, not whether the settings did.**
  That distinction cost two treatments. The renderer builds only what something
  feeds, so a knob can move its number and be wired to nothing; comparing a
  spec against a genre will call that a change every time. Anything that moves
  the desk asks `sound/reach.ts` first, and anything that claims to move the
  record renders it and measures — at 22050 Hz or above, because below about
  16 kHz the filters are pinned by their own stability clamps and a filter move
  measures as a no-op when it is nothing of the kind.
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
| what becomes of each part | `node tools/measure.ts --sweep <genre> 1 20 --parts` |
| how long a part goes unchanged | `node tools/stale.ts [genre] [first] [last]` |
| what each treatment is worth | `node tools/treatments.ts [genre] [seed]` |
| every test, then types | `npm test` · `npm run check` |
| the single file | `npm run build` |
