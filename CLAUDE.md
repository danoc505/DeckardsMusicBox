# Working on this program

Read `README.md` first for what the program is. This file is how work on it
is done.

## The piano roll is your main test

It is the first thing you reach for and the last thing you check. A record is
judged by ear, and nothing this repository asserts is a record — the suite can
be entirely green on a program that writes confetti — so the roll is what
tells you whether a change worked. Everything else here is a supporting check.

    npm run roll <genre> <seed>     the record as a picture, about a second
    npm run shot <genre> <seed>     the same record through the built page

Keep it open while you work. Roll the thing you are about to change, so you
know what it does now; roll it again after, so you can see what moved. Use it
to answer questions — is this section a return, does that part ever rest, did
the tune go anywhere — because those are visible in the picture and in nothing
else here.

Look at the PNG you produced before you say anything about it. When you claim
a change did something, show the picture that shows it — and when you are
judging a change rather than admiring a record, compare the same seeds before
and after, picked by something other than you.

`npm test` and `npm run check` are preconditions, not proof. Green means no
stated law was broken. It does not mean the result is music, and music is the
only thing this program is for.

`docs/THE-PIANO-ROLL.md` has how to read a roll, what to look for in what
order, and why there are two of them. Read it before your first change.

## The other tool, and what it is for

`tools/measure.ts` COUNTS. It reads a record back out of its own MIDI file and
reports the numbers — how a line moves, who plays which bar, the same over
twenty seeds — which is how the melody and intro research was measured, and
which no picture can do. It draws one part as a grid of characters along the
way; that grid is not a piano roll and is not what proves a change.

## The research, and where it lives

Every rule in this program comes from a document, and each one follows the same
shape: the research first, then a table of what went into the program, then
what it came to when measured. Write the next one that way.

- `docs/THE-PIANO-ROLL.md` — how to read a roll and what to look for, in order.
- `docs/genre-research/MELODY-AND-THE-HOOK.md` — the tune: a figure that comes
  back, the contour it walks, the one wide leap.
- `docs/genre-research/THE-INTRO.md` — how a record opens, the three ways in,
  and the break. §7 is the worked example of a rule deleted for doing nothing.
- `docs/genre-research/THE-ARRANGEMENT-AS-STORY.md` — who plays when, and why
  that is a narrative and not a texture. The newest, and the least finished.

## Where the work is

Three things are open, all of them in `THE-ARRANGEMENT-AS-STORY.md` §8, in the
order I would pick them up.

**1. §8's numbers cannot be reproduced from this repository.** They were
measured with a throwaway script over `tools/measure.ts --json`, and that
script is not here. Nothing else in these docs has that problem, and it should
not be the first thing you discover. Give `measure.ts` a mode that reports
what becomes of a part across a sweep — its share, its longest absence, whether
it is playing at the end, whether the most-present part changes between halves
— and §8 becomes checkable instead of asserted.

**2. lofi's hierarchy does not move.** The section decision in `arrange.ts` now
derives who plays from what the record has done, which took dungeon synth's
top-part-change from 30% to 45%. lofi's went the other way, 20% to 15%. Its
drums sit at the bottom of its own shed order and play nearly every bar, so its
most-present part is close to fixed whatever this rule does. Either the measure
asks lofi the wrong question, or the rule needs a term that knows about RANK
rather than presence. Unsolved, and it is the interesting one.

**3. The absence ceiling has no number, and may not need one.** `1/(1+out)` in
the section decision is a soft ceiling, and it did the work on its own: parts
abandoned before the last quarter fell from 15% and 25% to 5% in both genres.
Whether a stated number does anything that soft term does not has never been
tested. Test it on and off — and if it does nothing, delete it and keep the
note, which is the house rule.

Also true and not yet a problem anybody has felt: no part arrives late in lofi.
0% of its records hear something for the first time after halfway, against 30%
in dungeon synth, because parts arrive in a fixed order.

## House rules that are easy to break

- **A knob that does nothing is this program's cardinal sin.** If a rule is
  built, measure it on and off. If it changes nothing, delete the field and
  keep the note saying it was tried — `docs/genre-research/THE-INTRO.md` §7 is
  the worked example.
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
