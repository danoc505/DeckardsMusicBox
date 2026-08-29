# Deckard's Orchestrator MK2

A generative-music instrument that composes and plays complete songs — drums,
bass, chords, melody, a second melody and a repeating figure — with a rack of
modelled machines you can put your hands on while it plays. It ships as **one
self-contained HTML file**: no server, no build step, no internet, no
dependencies. Open it and press play.

```
Deckards Orchestrator MK2.html   ← the whole program. Double-click to run.
```

**Working on it? Read `docs/START-HERE.md` first.** It is short and it is
everything that binds you.

---

## The four laws

When a decision is not covered by something written down, decide it the way
these point.

**1. Music theory is the ground.** Scales, chord tones, resolution, registers.
These are collision rules, not style choices. Genres move inside them. Research
lands in `docs/genre-research/` with named sources before a table changes.

**2. Hard laws and soft laws.** A hard law is what a thing *is*, and it holds
for every genre: an intro can only be at the start of a song, an outro only at
the end, the bass is the lowest part. A soft law is how a thing usually goes —
a habit with weights, living in the genre tables, and any genre may lean on it
or not.

**3. Constraints, not baked-in values.** A genre or a stage declares a
constraint and the program works inside it. *That an intro comes first is hard.
What an intro sounds like is not.* A literal value wired into stage logic is a
defect even when it sounds right.

**4. The printed notes are the test.** `node harness/mk2_roll.js` draws the whole
record as a piano roll on one page — every part, one colour each, pitch up the
page and time across it. `node harness/mk2_score.js` prints the same song as
exact notes. Do both before your change and after, and read them. A change meant
to move the music that leaves it identical has not been made.

---

## Write in plain English

The person this is built for is not a musician and not an engineer. Everything
you say to them and everything you write down — replies, commits, docs,
comments, the words on screen — has to be readable by them.

- Say what a thing **does**, not what it is **called**. "The pad plays in every
  bar and never stops", not "the harmonic-filler layer is doubled".
- If a technical word is genuinely unavoidable, explain it in the same sentence.
- Short sentences. One idea each.
- Numbers are welcome. A number is not jargon. "It played in 98 out of every
  100 bars" beats "occupancy was high".

| stop writing | write this |
|---|---|
| comp / harmonic filler | the chords, the chord part |
| keys2 / the pad | the second keyboard |
| voicing | how the notes of a chord are spread out |
| blast radius | which songs changed |
| rootless voicing | a chord with its bottom note left out |
| occupancy / share of bars | how many bars it plays in |
| the ostinato | the repeating figure |
| the counter | the second melody |
| non-chord tone | a note that clashes with the chord under it |

If they have to ask what you meant, that is a defect in the writing.

---

## How it works

Six stages, each one freezing its output before the next reads it:

```
CHART → FORM → MATERIALS → ARRANGEMENT → PERFORMANCE → SOUND
```

**There are no correcting passes.** Material is valid because its owner made it
valid, or its owner redrew. Every law is a constraint on the next choice, never
a repair applied afterwards.

Same `(seed, genre, rig, picks, pins)` gives the same song, exactly. There is no
`Math.random` in the file; randomness comes from named substreams, and draws
execute unconditionally, so adding a feature cannot silently move songs you did
not touch.

A genre is **parameter tables only** — no code below stage 1 may name a genre or
branch on one. Genres can also be blended: the sliders resolve any mixture to
one table before a note exists.

How many genres there are, and which, is **not written here** — ask the program
with `MK2.genres()`.

---

## Layout

| Path | What's inside |
|---|---|
| `Deckards Orchestrator MK2.html` | **The program.** Engine, rack, panels, UI. |
| `docs/START-HERE.md` | **Read this before touching the HTML.** The laws, the pipeline, the harness. |
| `harness/` | The printout — `mk2_score.js`, the test — plus the publish record and the sample-bank builders. |
| `docs/genre-research/` | The research the music stands on. Named sources, measured structures. |
| `docs/` | Corpus sources, licensing, arrangement and synth research, the backlog. |
| `corpus/` | Python scripts that ingest open sources and build the embedded tables. |
| `samples/` | Sample assets that belong to the repo. |
| `Improv Machine playable_BETA 0.1.html` | MK1. Frozen — reference and corpus source only. |

---

## Running the tools

No build step — the printer reads the shipped HTML directly.

```sh
node harness/mk2_roll.js                        # THE test. The whole record, drawn
node harness/mk2_score.js                       # the same song as notes, bar by bar
node harness/mk2_score.js --genre lofi --seed 7 # one record
node harness/mk2_score.js --mid out/            # ...and real .mid files with it
node harness/mk2_stamp.js check                 # is the published page this build?
```

`harness/README.md` has the rest of the flags.

---

## How to work on it

- **Honesty above all.** If you have not measured it, say so. If a test passed,
  say which test. Mark guesses `[GUESS]`.
- **One owner per property.** If two places can write it, it has no owner.
- **No correcting passes.** Constrain the next choice; never repair the last one.
- **Seam checks throw.** `composeSong` proves its own output every song.
- **Provenance on every constant** — `[corpus:…]`, `[theory]`, `[CHOSEN]`,
  `[GUESS]`. A provenance that does not match its constant is worse than none,
  because it stops anyone checking.
- **When a measurement surprises you, suspect the measurement first.**
- **Research before tables.** Published data — measured structures, artist
  interviews, named analyses — is the only signal that can improve this music.
  Never from imagination.
- **The user's ears are the final judge.** Ship the file; do not render songs at
  them.
