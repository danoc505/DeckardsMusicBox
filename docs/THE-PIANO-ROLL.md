# The piano roll: the main test

This program makes records. A record is judged by ear, and nothing an
automated test asserts is a record — the suite can be entirely green on a
program that writes confetti. So the roll is the test: it is how you see what
the program is doing, how you tell whether a change worked, and what you show
when you say it did. Everything else in this repository is a supporting check.

    npm run roll lofi 42                 the record as a piano roll PNG
    npm run roll lofi 42 out.png --bars 0-32     one passage, close up
    npm run shot lofi 42                 the page's own roll, through the built file

Run it the way you would keep a scope on a bench: before you touch anything,
to see what it does now; after, to see what changed. Not a report you file at
the end — the thing you are looking at while you work.

---

## 1. Why a picture, and not the assertions

The suite has 269 tests and they are worth keeping: they hold the laws that
can be stated as laws — that a part is never silent by omission, that a rhythm
intro carries nothing but drums and bass, that the same seed is the same
bytes. What they cannot hold is whether the result is *music*, and that is the
only question that matters here.

Four failures this program can have with a green suite:

| what it looks like | what the assertions see |
|---|---|
| every bar identical for two minutes | every law satisfied |
| a part that plays constantly and never rests | it is heard in every section, as required |
| a tune that is one figure repeated forty times | the hook is stated, the contour is legal |
| a section that returns and is indistinguishable | the idea was stated, the variant was built |

Each of those is obvious in one second of looking at the roll, and invisible
to everything else in this repository. **Repetition is the thing the picture is
for**: a two-bar cell that comes back should be a visual rhyme, and a section
that restates another should look like it. If the picture is confetti, the
music is confetti — and if the picture is a solid block, the record is a loop.

## 2. The two rolls, and why there are two

**`npm run roll`** (`tools/roll.mjs`) imports `src/song.ts`, composes, and
writes the PNG itself — the file format is built by hand in the tool. No
browser, no build, no dependency, about a second. **This is the everyday test.**
It is a picture of the pipeline.

**`npm run shot`** (`tools/shot.mjs`) loads the built single file in headless
Chromium, drives the page's own controls, and screenshots the page's own
`#roll` canvas. It needs `npm run build` and Playwright first. **This is the
one you run before you believe it.** It is a picture of the program.

They draw the same record from the same pipeline, so they should agree. The
day they do not, *the disagreement is the bug*: a build that shipped stale
code, or a page reading a field the pipeline stopped writing. Neither tool can
see inside the other, which is what makes the agreement worth anything.

## 3. How to read one

**Colour is the part.** drums orange · bass yellow · keys cyan · lead pink ·
drone green. Brightness is how hard the note was played.

**The line across the very top is the desk**, and it is the first thing to
read: `DESK:` and then every alteration this record uses, in the order it
first reaches for them, each with a swatch of the colour its row is drawn in
at the bottom. It answers the question you ask of a record before any other —
what did it DO — without hunting for names scattered down the page. The same
colour appears three times: here, on the strip where that treatment starts,
and on its own row in the FX roll. If more names exist than fit, the count of
what is missing is printed rather than the list quietly ending.

**The amber verticals are section starts**, and each is labelled with what the
section is and which material it states — `CHORUS B`, `OUTRO A/1`. The ribbon
along the top of a section is at full weight when the form declared it the
peak. A section labelled with the same material as an earlier one is a return,
and it had better not look identical: the rule of three says the third hearing
of an idea differs.

**The band under the labels is the arrangement's own clock.** One tick at
every two-turn boundary, and one block per part that is in across that span —
so who comes and goes shows as a change in the picture, not only in the notes.
An amber underline on a span is the drums thinned: a breath, not a stop.

**AND UNDER THE DRUMS, THE FX ROLL.** A treatment moves the mixer and not one
note, so it is invisible on the piano roll BY CONSTRUCTION — the same record
with and without its whole desk timeline draws the identical picture. This
document used to say only "do not judge a treatment by the roll", and the roll
answered by printing a treatment's name in small grey type. A name says a
change happened; it does not say what changed, for how long, or what else was
moving at the time.

So the desk has a roll of its own, below the drums:

- **one row per treatment this record actually reaches for**, in the order it
  first reaches for it, drawn as a bar across the stretch it is in force. The
  colour is the treatment's own, taken from its name, so the same move is the
  same colour in every record and two rolls can be read against each other.
  Where a treatment is aimed at ONE part, that part's name is written on the
  bar in that part's colour.
- **a faint ramp at the start of a bar** is `drift`: how long that treatment
  takes to arrive rather than switching in one sample.
- **then one row per MOVING KNOB** — the genre's `sound.motion` cycles — drawn
  as the curve each one actually is, about its own centre line. These are the
  only continuous things in the picture, and telling a cliff from a slope at a
  glance is the whole reason they are drawn differently.

A record whose FX roll is nearly empty is a record whose desk is idle, and
that is worth seeing: lofi seed 17279 reaches for TWO treatments where dungeon
synth on the same seed reaches for twelve.

**The gutter names the octaves** (`C4`) and the drum lanes (`KCK` `SNR` `HAT`
`OHH`). Drums are the bottom band, on their own lanes; everything else is at
its pitch.

`npm run roll` also prints the form beside the picture — every section with
its bars, material, energy, and its `PEAK` / `VARY` / `THIN` flags — so the
thing you are looking at and the thing the program thinks it made are on the
screen together.

## 4. What to look for, in order

1. **Is it a loop?** Scan left to right. If bar 30 looks like bar 2 and
   everything between is the same, the record is a loop with a section list
   painted over it.
2. **Does the texture move?** Parts should arrive and leave. A solid block of
   one colour from the first chorus to the end is the failure the arrangement
   stage was written to prevent — see `src/stage/arrange.ts`, "arriving is not
   staying".
3. **Does the tune go anywhere?** The pink should have a shape: a highest note
   that happens once, near the end of its phrase, and a leap answered the
   other way. See `docs/genre-research/MELODY-AND-THE-HOOK.md`.
4. **Is the opening kept?** What plays in bar one should be recognisable when
   it returns. See `docs/genre-research/THE-INTRO.md`.
5. **Do returns differ?** Two sections on the same material, side by side in
   the picture, should rhyme without matching.

## 5. Using it honestly

The roll shows one seed. One seed is an anecdote, so when you are judging
whether a CHANGE worked rather than looking at a particular record, roll the
same seeds before and after and compare — and let something else pick the
seeds. A seed you chose is a seed that worked.

How many depends on what you are asking. One is enough to see a shape you
just built. A handful is what you want before believing a rule holds in
general. `tools/measure.ts --sweep` counts across twenty when the question is
statistical rather than visual — that is what the melody and intro research
was measured with.

A green suite is a precondition, not a proof: `npm test` says no stated law
was broken, and the roll says whether it is music. When you claim a change did
something, show the picture that shows it.
