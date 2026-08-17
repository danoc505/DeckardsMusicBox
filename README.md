# Deckard's Orchestrator MK2

> ## ⚠ RULE ZERO — WRITE IN PLAIN ENGLISH. ALWAYS.
>
> **The person this is built for is not a musician and not an engineer, and has
> said so many times. Jargon has been rejected over and over. It is still
> happening. So it is a rule now, not a preference.**
>
> This applies to everything you say to them and everything you write down:
> chat replies, commit messages, docs, comments, and the words on screen.
>
> **How to do it:**
>
> - Say what a thing DOES, not what it is CALLED. "The pad plays in every bar
>   and never stops" — not "the harmonic-filler layer is doubled".
> - If a technical word is genuinely unavoidable, explain it in the same
>   sentence, in ordinary words: "the second keyboard (the sustained, chord-
>   holding one)".
> - Short sentences. One idea each.
> - Numbers are fine and welcome — a number is not jargon. "It played in 98 out
>   of every 100 bars" beats "occupancy was high".
> - No borrowed vocabulary as shorthand. Not "blast radius", "conditional
>   rate", "rootless voicing", "drop-2", "spectral filler", "byHand" — unless
>   you say plainly what each one means right there.
> - Never make them ask what you meant. If they have to ask, that is a defect
>   in the writing, not in their understanding.
>
> **Some words that keep appearing, and what to say instead:**
>
> | stop writing | write this |
> |---|---|
> | comp / harmonic filler | the chords, the chord part |
> | keys2 / the pad | the second keyboard |
> | voicing | how the notes of a chord are spread out |
> | blast radius | which songs changed |
> | rootless voicing | a chord with its bottom note left out |
> | occupancy / share of bars | how many bars it plays in |
> | the ostinato | the repeating figure |
> | the counter | the second melody |
> | non-chord tone | a note that clashes with the chord under it |
>
> This rule outranks sounding precise. If a sentence is exact but they cannot
> read it, it has failed.

> ## ⚠ RULE ONE — PRINT THE NOTES AND READ THEM. EVERY TIME.
>
> **You have no a verdict on it. The printed notes are the test.** Not one test among
> several — the one that tells you what the music actually did. Every change,
> every time, on top of whatever else you ran:
>
> ```sh
> node harness/mk2_roll.js 1 --genre lofi        # and all six others
> ```
>
> Print it **before** the change and **after**, and put the two side by side.
> If you think nothing moved, this is how you find out you were wrong. If
> something did move, this is the only place you can see what.
>
> **Two traps, both of which have already caught someone:**
>
> - **`--genre` is a flag, and a bare genre name is silently ignored.**
>   `mk2_roll.js 1 vgm` composes **lofi**. Read the header line of every
>   printout and check it names the genre you asked for.
> - **Passing the test battery is not a substitute.** The snapshot goes red
>   when a decorative field is added and no note moved; the seam checks prove
>   the laws hold, not that the music is any good. Neither one shows you a
>   chord changing from minor to dominant. The printout does.
>
> **And there is now a second way to look, in the program itself: THE ROLL**, at
> the top of the page. It draws the same notes through the same function the
> .mid export uses, so it shows the file you would export — the whole song at
> once, one colour a part, click a part to see it alone. Use it to read the
> ARRANGEMENT (what the groove and the arc thinner actually did) and the
> printout to read the MATERIAL (what stage 3 wrote). They are different
> pictures on purpose and the difference is worth knowing.

A generative-music instrument that composes and plays complete songs — drums,
bass, chords, melody, a second melody and a repeating figure — across **seven
genres**, with a rack of modelled machines you can put your hands on while it
plays. It ships as **one self-contained HTML file**: no server, no build step,
no internet, no dependencies. Open it and press play.

```
Deckards Orchestrator MK2.html   ← the whole program. Double-click to run.
```

## What it does

Six stages, each one freezing its output before the next reads it:

```
CHART → FORM → MATERIALS → ARRANGEMENT → PERFORMANCE → SOUND
```

**There are no correcting passes.** MK1 had a "ghost pass" that repaired
violations after the fact; removing that idea is the central reason MK2 exists.
Material is valid because its owner made it valid, or its owner redrew. Every
law is a *constraint on the next choice*, never a fix applied afterwards.

Same `(seed, genre, rig, picks, pins)` → the same song, exactly. There is no
`Math.random` anywhere in the file; randomness comes from named substreams, and
draws execute unconditionally so adding a feature cannot silently move songs
you did not touch.

A genre is **parameter tables only** — no code below stage 1 may name a genre or
branch on one. Genres can also be *blended*: the sliders resolve any mixture to
one table before a note exists.

How many genres, and which, is deliberately **not written here** — a list in
prose goes stale and this one already did, twice. Ask the program:
```js
MK2.genres()
```

## Layout

| Path | What's inside |
|---|---|
| `Deckards Orchestrator MK2.html` | **The program.** Everything: engine, rack, panels, UI. |
| `harness/` | Everything that holds the program to a number. Start at `harness/README.md`. |
| `docs/HANDOFF-MK2.md` | **Read this before touching the HTML.** The constitution, the laws, what is done and what is not. |
| `docs/genre-research/NOTES-FROM-THE-USER.md` | The running log of what was measured, what turned out wrong, and why. Read it with the handoff. |
| `docs/` | Genre research, corpus sources, licensing, arrangement and synth research. |
| `corpus/` | Python scripts that ingest open sources and build the embedded tables. |
| `samples/` | Sample assets that belong to the repo (payloads are embedded, corpora never are). |
| `Improv Machine playable_BETA 0.1.html` | **MK1. Frozen** — reference and corpus source only. Its synthwave synth and drums are worth reading before redoing either. |

## Running the tools

No build step — every tool reads the shipped HTML directly.

```sh
node harness/mk2_test.js                                    # the seam checks
node harness/mk2_test.js kit                                # ...only the ones named "kit"
node harness/mk2_ui.js                                      # the front panel, real browser
node harness/mk2_blend.js                                   # the blend sliders
node harness/mk2_snapshot.js check harness/mk2_baseline.snap
node harness/probe_voices.js                                # every voice fires, none silent
node harness/mk2_midi.js                                    # the MIDI port

node harness/mk2_roll.js 1                                  # THE test that matters: read the notes
```

`mk2_snapshot check` and `mk2_ui` each default to a cheap form and take
`--full` for the exhaustive one. That is deliberate: the exhaustive form should
be a decision, not a habit.

`harness/README.md` lists the rest — the probes for the comp, the harmony, the
cymbals, every knob on every machine, and whether the genre outweighs the seed.

## The four principles

The design in one breath — when a decision is not covered by a written law,
decide it the way these point:

1. **Constraints, not baked-in values.** A genre or stage declares a
   constraint and the program works inside it. A literal value wired into
   stage logic is a defect even when it sounds right.
2. **Soft laws and hard laws.** A hard law is definitional and holds for every
   genre — an intro can only be at the start of a song, an outro only at the
   end. A soft law is a habit with weights, and lives in the genre tables
   where a genre can lean on it or not.
3. **Music theory is the physics engine.** Scales, chord tones, resolution,
   registers: collision rules, not style choices. Genres move inside them, and
   a violation throws — the program does not negotiate with physics.
4. **Music is novelty, constrained — driven by arithmetic and randomness.**
   Pure rule is a loop; pure dice is a shuffle. The music lives between,
   and the constraint is the generator.

## Design laws (the short version)

- **Honesty above all.** If you have not measured it, say so. If a test passed,
  say which test. Mark guesses `[GUESS]`. A green checkmark you did not earn
  costs more than a bug you reported.
- **One owner per property.** If two places can write it, it has no owner.
- **No correcting passes.** Constrain the next choice; never repair the last one.
- **Seam checks throw.** `composeSong` proves its own output every song.
- **Provenance on every constant** — `[corpus:…]`, `[theory]`, `[CHOSEN]`,
  `[GUESS]`. A provenance that does not match its constant is *worse* than none,
  because it stops anyone checking.
- **When a measurement surprises you, suspect the measurement first.**
- **Full research for every genre you touch.** You have no a verdict on it; published
  data — measured structures, artist interviews, named analyses — is the only
  signal that can improve this music. Research lands in `docs/genre-research/`
  with named sources *before* the table changes. Never from imagination.
- **The user's a verdict on it are the final judge.** Ship the file; do not render songs at
  them.
