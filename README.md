# Deckard's Orchestrator MKIII

> **First time here?** See [`HANDOFF.md`](HANDOFF.md) for what was just done, why, and what needs to happen next.

A seeded record maker. The same genre and seed is the same record, every
time, anywhere: as notes, as a text dump, as a WAV, in the page.

    npm run roll lofi 42                        the record as a picture — what you work with
    npm run shot lofi 42                        the same record through the built page
    npm test                                    every law that can be stated as a law
    npm run check                               types
    node src/cli.ts lofi 42 --summary           one line
    node src/cli.ts lofi 42                     the record as text (tools/FORMAT.md)
    node src/cli.ts lofi 42 --wav out.wav       the record as sound
    npm run build                               "Deckards Orchestrator MKIII.html", one file, open it
    node tools/measure.ts lofi 42               ONE part as characters + its numbers, off its own MIDI
    node tools/measure.ts --sweep lofi 1 20     the same numbers over twenty seeds
    node tools/measure.ts lofi 42 --map         who plays which bar, and how the record opens
    node tools/measure.ts lofi 42 --json        the parsed notes and the numbers, for a drawing

**The piano roll is the main test.** A record is judged by ear, and no
assertion is a record: this suite can be entirely green on a program that
writes confetti. So the roll is what tells you whether a change worked — roll
it before, roll it after, and look at what moved. `npm run roll` draws it
straight out of the pipeline in about a second; `npm run shot` drives the
built page and shoots its own canvas, and the two disagreeing is itself a bug.
How to read a roll and what to look for are in `docs/THE-PIANO-ROLL.md`.

## How a change is made here

**Find what already owns this, and change that.** This program is a small
number of mechanisms, each of which already knows the laws it keeps. The
arrangement is one: `push()` builds every candidate move applying the laws —
the floor, the peak, the close, the drone, the walk-in — the score ranks what
`push()` offered, and the best is taken. `resolve.ts` refuses a bad genre at
load. `deskOf` refuses a treatment that would do nothing. `settle` merges a
desk. `manner()` picks how a note is played.

So before writing anything, read what you are about to change and answer one
question in the terms it already uses: **what owns this, and how does it
already say things of this kind?** Whatever the work is, it has an owner:

| the work | where it goes |
|---|---|
| a rule about which moves are legal | `push()`, with the other refusals |
| a rule about which move is best | the score, as one more term in the product |
| a number a genre may state | `spec.ts` + a default + a `resolve.ts` check + a source |
| a bug | the code that has the defect — never a guard wrapped around it |
| a thing the program should be able to say | the writer that already says things of that kind (`dump.ts`, the roll, `measure.ts`) |
| a measurement | the tool that already measures that kind of thing, or a new tool beside them if it reads a different input |
| a behaviour nobody wants any more | delete the field and keep the note saying it was tried |
| something the reader must know | the doc that already covers that ground, not a new one beside it |

Two of those are the ones people get wrong. **A bug is fixed where the defect
is.** A check added around broken code leaves the break in place for the next
caller. **And a thing to delete is deleted**, not disabled behind a flag: a
flag that turns a rule off is two behaviours to reason about for ever.

**A second mechanism beside the first is the failure mode this program is
most prone to**, because it always works at first and the bill comes later. It
looks like: a loop after the one that already chose, re-scanning the same
pool; a guard restated because the code that had it is elsewhere; state
rebuilt by hand that a constructor already built; a new flag invented to
referee between the old path and the new one. Every one of those is a law
kept in a reader, and **a law kept in a reader is a law the next reader
breaks**. It has cost this program its climax once already: a second
selection loop after the arrangement's score did not know that "at a peak the
change is expression only", and half of all records came out with their
biggest moment as their thinnest — while every test stayed green, because the
law was in a comment and not in the code.

The tell that a change is bolted on rather than built in:

- it restates a condition that already exists somewhere else
- it mutates state that some constructor or `push` already assembles
- deleting it would leave the surrounding code coherent, unchanged
- it needed a new flag whose only job is to coordinate two code paths
- the file's own header no longer describes what the file does

If a change cannot be expressed inside the mechanism that owns it, that is a
finding about the mechanism and worth saying out loud — the mechanism gets
extended, or the plan changes. It is not a licence to run a second one beside
it.

## Prove it, or it did not happen

A change is not finished when it runs. It is finished when the program can be
shown to do something it did not do before, on records nobody picked to
flatter it. That means, every time:

- **Measure the code that was there, not just the code you wrote.** Check out
  the commit before yours (`git worktree add /tmp/before <sha>`), run the same
  tool with the same seeds, and put the two columns side by side. A number
  with nothing beside it is not evidence.
- **Let something else pick the seeds.** A seed you chose is a seed that
  worked. Draw them at random, print the seeds you drew, and report every one
  of them — including the ones that did not improve.
- **Measure what the change was NOT aiming at.** This is the one that catches
  real damage. A staleness figure bought with the record's climax is not an
  improvement, and nothing you were watching would have told you. So check the
  section-level numbers — who opens, thinnest, fullest, the peak — every time,
  whatever you were changing.
- **Look at the roll.** For anything that touches notes or who plays when,
  roll it before and after and LOOK at the picture. `docs/THE-PIANO-ROLL.md`
  says what to look for.
- **Say the size of the win plainly, per genre.** If it works for one genre
  and not the other, that is the result — report it that way rather than
  averaging the two into one better-looking number.

If a change cannot be shown to have done anything, it is a knob that does
nothing, and this program's rule for those is to delete the field and keep the
note saying it was tried (`THE-INTRO.md` §7 is the worked example).

Node 22 runs the TypeScript directly. There is no bundler: the build
transpiles `src/` into a forty-line module registry inside `tools/page.html`.

The pipeline is five pure stages and a renderer, each frozen on the way out:
chart, form, arrangement, materials, performance, sound (`src/stage/`,
`src/sound/`). A genre is data (`src/genre/`), resolved once against one
table of defaults and refused at load if anything is wrong; every number a
genre states carries its source in the genre's `sources` map, and a number
without one says `[chosen]`.

Two genres, lofi hip hop and dungeon synth. Five parts — drums, bass, keys,
lead, drone — and six synthesised voices. Every rule is written in beats and
resolved against the genre's own metre, so a genre in five four needs no new
code, only its own numbers.

The sound is a desk (`src/sound/`): each part through a pedal board by its
own feed, placed in a stereo world by azimuth and distance, sent to five
returns — echo, spring, room, ensemble, flange — that can be patched into
each other and themselves, then the inserts on the sum: pole, tape, medium,
vinyl, master. Every knob is the genre's, and the page lays its own
positions over them without changing the genre.

The board is twelve pedals in the order a cable runs them
(`src/sound/pedals.ts`, `src/sound/dsp.ts`): a Dyna Comp, a wah, an octave
divider, a Super-Fuzz octave up, a Fuzz Face, a Big Muff, an overdrive, a
fuzz, a Boss HM-2, the power supply's own sag, a phaser and a tremolo. Each
is a circuit archetype built from published teardowns, and each is OFF the
board at mix 0 rather than bypassed on it — a genre that uses one pedal pays
for one.

The drums are a machine (`src/sound/tr1000.ts`): one box with a kit loaded
into it, a channel strip on every lane — tune, decay, level, filter, and its
own send to each return — and one drive and one filter across the whole kit.
Two kits, `acoustic` (this program's own drums, played by the strip as a
sampler channel plays a recording) and `analog` (the 808 and 909 circuits,
switched between as two instruments and not two ends of a dial). At its
defaults the machine is a wire and the record is the one it always was.

The record is made a block at a time. `Engine` (`src/sound/render.ts`) holds
every filter, delay line and feedback loop of the desk and fills whatever
length of buffer it is handed; `render` is that engine driven from end to
end, and the page drives the same engine a fifth of a second at a time. So
Play sounds at once, Stop is at once, and a knob moved while the record
plays is heard as soon as the chunks already on the clock run out — the
engine takes the new desk and keeps its tails. What you hear and what you
save come off the same code, and the tests hold the record to being the same
bytes whatever size block it was made in.

The page (`tools/page.html`, built into the single file) is a bridge: a
piano roll, a radar scope for the world, a matrix mixer, a pin matrix for
the patch, the drum machine's panel and its strips, the pedal board and the
rack, each rack unit with a screen of its own impulse response. It plays
through a worker that stays about half a second in front, and saves through a
second one, so rendering a file never interrupts the record.

The melody is theory as constraint: a phrase states a figure and restates it,
walks one of Huron's contour shapes and closes where that shape was going,
spends at most one interval wider than a fifth, answers a leap the other way,
and keeps its highest note an event rather than a ceiling. Every one of those
is a preference applied after the hard laws, so none of them can write a wrong
note. The sources are in `docs/genre-research/MELODY-AND-THE-HOOK.md`; the
proof is `tools/measure.ts`, which composes a record, writes the bytes a
sequencer would open, parses those bytes back, and prints one part as
characters with the numbers beside it — nothing in it can see a variable inside the builders.

How a record opens is a rule too, and the same tool reads it back: an intro is
measured on a clock rather than in bars, it is one of three documented ways in
— the beat alone, the foundation without the tune, or the tune from bar one —
and one section later, where a bridge sits, is a BREAK: the only place a
record goes below its floor, carrying what it opened with and nothing else.
See `docs/genre-research/THE-INTRO.md`, which also records the rule that was
built for this and measured at exactly nothing.

`docs/TALLY.md` is where the work stands: what has been done with the number
behind each, what is open and what would close it, and what was deliberately
left alone. Its first entry is the one that outranks the rest — none of the
recent work has been listened to by a person.

And the record moves its own desk. The rule of three says a third hearing must
differ, and until recently the only way this program could answer that was to
rewrite the notes — so a third of every variant it built was heard once and
never again, which is not a return at all. Now an idea's last hearing is never
varied, and the demand travels instead to the arrangement as a TREATMENT: a
change to the section that leaves every pitch where it is. Twelve of them
(`src/stage/treat.ts`) — darker, wetter, wider, further off, harder through the
board, more worn — each a pure function of the genre's own desk, each refused
where it would change nothing, and each landing on the exact sample the
arrangement put it on rather than on whatever block the player asked for. The
catalogue and what is still unbuilt are in
`docs/genre-research/THE-ALTERATIONS.md`.

The middle of a record is `docs/genre-research/DUNGEON-SYNTH-ARRANGEMENT.md`:
what one genre's own literature says about which parts play and when, measured
against what this program actually does over sixty seeds. Nothing in it is
applied — it is the reading, and it names two places where dungeon synth is
still running on a default written for pop.

`Deckards Orchestrator MK2.html` is the previous program, kept whole and
runnable. `tools/dump.mjs` reads its notes out in the same text format.
