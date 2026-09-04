# Working on this program

Read `README.md` first for what the program is. This file is how work on it
is proved.

## The piano roll is the only proof

A record is judged by ear. Nothing this repository asserts is a record — the
suite can be entirely green on a program that writes confetti — so no change
to how this program composes is finished until it has been looked at as a
picture.

    npm run roll <genre> <seed>          the everyday test, about a second
    npm run shot <genre> --random 3      the page's own canvas, before you believe it

**Three randomly drawn seeds, rolled, looked at, and pasted into your reply.**
Draw them with a random number generator, not from your head: a seed you chose
is a seed that worked. Look at the PNGs you produced — actually open them —
before you claim anything about them. Then paste them.

`npm test` and `npm run check` are preconditions, not proof. Green means no
stated law was broken. It does not mean the result is music, and music is the
only thing this program is for.

`docs/THE-PIANO-ROLL.md` has how to read a roll, what to look for in what
order, and why there are two of them. Read it before your first change.

## What NOT to call a piano roll

`tools/roll.ts` prints ONE part as a grid of characters, with measurements of
the tune beside it. It is useful — it reads a real MIDI file back and can see
nothing inside the builders — and its numbers are how the melody and intro
research was measured. **It is not the piano roll and it does not prove a
change.** It shows one part, in a window of bars, with no sections, no
arrangement and no drums.

The two comments in that file calling its output "the ASCII roll" are wrong
twice over: it is not the roll, and it is not ASCII (the empty cell is U+00B7
MIDDLE DOT).

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
