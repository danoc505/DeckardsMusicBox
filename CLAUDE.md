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
