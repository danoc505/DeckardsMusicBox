# Working on this program

`README.md` says what the program is. This file says how it is worked on and
where it has got to.

## What we are doing

The program makes records, and the whole difficulty is that a record can only
be judged by ear. Nothing here asserts one — the suite can be entirely green on
a program that writes confetti. So the work is always the same shape: find
something the program does badly, find a published account of how music
actually does it, build the smallest rule that follows, and measure whether it
changed anything.

## The piano roll is your main test

    npm run roll <genre> <seed>     the record as a picture, about a second
    npm run shot <genre> <seed>     the same record through the built page

Roll the thing you are about to change, then roll it again after. It is the
only way to see whether a section is a return, whether a part ever rests,
whether the tune went anywhere. Look at the PNG before you say anything about
it, and when you claim a change did something, show the picture that shows it.

`npm test` and `npm run check` are preconditions, not proof: green means no
stated law was broken, not that the result is music.

`tools/measure.ts` COUNTS — how a line moves, who plays which bar, the same
over twenty seeds. That is how the research below was measured and no picture
can do it. The character grid it draws is not a piano roll.

`docs/THE-PIANO-ROLL.md` is how to read one.

## The research

Every rule in this program comes from a document, and each has the same shape:
the research, then what went into the program, then what it came to when
measured. Write the next one that way.

| `docs/genre-research/` | what it settles |
|---|---|
| `MELODY-AND-THE-HOOK.md` | the tune: a figure that comes back, the contour it walks, the one wide leap |
| `THE-INTRO.md` | how a record opens — three ways in — and the break. §7 is the worked example of a rule deleted for doing nothing |
| `THE-ARRANGEMENT-AS-STORY.md` | who plays when, and why that is a narrative rather than a texture |

## What was just done, and why

The arrangement chose who played in a section by walking a list the genre wrote
before the record existed — same names, same order, every section of every
seed. A list has no memory, so nothing that happened in a record could affect
it, and a rank that cannot change as a consequence is not a story (Almén).
Measured, that gave two opposite failures of the one missing idea: lofi's
opening part played 91% of the record and was never gone more than three bars,
so nothing ever happened to it, while dungeon synth abandoned its opener
outright in a quarter of records.

It now picks the part the record can most spare, out of what has actually
happened; the genre's `shed` order survives as a weight rather than an order.
Parts stopped being abandoned — gone for good fell from 15% and 25% to 5% in
both genres. The opening gets no rule of its own: it is simply the part with
the most standing while a record is young.

## What needs doing

**1. `THE-ARRANGEMENT-AS-STORY.md` §8 cites numbers this repository cannot
reproduce.** They were measured with a script that is not here — the only
unverifiable claim in these docs, and it undermines the rest of them. Give
`measure.ts` a mode that reports what becomes of a part across a sweep: its
share, its longest absence, whether it plays at the end, whether the
most-present part changes between halves.

**2. lofi's hierarchy does not move.** The new rule took dungeon synth's
top-part-change from 30% to 45%; lofi's fell, 20% to 15%. Its drums sit at the
bottom of its own shed order and play nearly every bar, so its most-present
part is near-fixed whatever the rule does. Either the measure asks lofi the
wrong question, or the rule needs a term that knows about RANK rather than
presence. This is the interesting one.

**3. The absence ceiling has no number and may not need one.** The `1/(1+out)`
term in the section decision is a soft ceiling and it did the work alone.
Whether a stated number adds anything has never been tested. Test it on and
off; if it does nothing, delete it and keep the note.

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
- The pipeline is five pure stages, each frozen on the way out. Selection
  happens in the arrangement, before a note exists; the material stage builds
  only what the arrangement will have heard.

## Do not

- Do not commit generated rolls, shots or dumps — they are reproducible from
  the program and the seed, and `.gitignore` already covers them.
- Do not change behaviour to make a test pass. The tests encode research; if
  one is wrong, the doc it came from is what has to change first.
