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
