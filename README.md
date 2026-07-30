# Deckard's Orchestrator MK2

A generative-music instrument that composes and plays complete songs — drums,
bass, comp, melody, countermelody and ostinato — across **seven genres**, with a
rack of modelled machines you can put your hands on while it plays. It ships as
**one self-contained HTML file**: no server, no build step, no internet, no
dependencies. Open it and press play.

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

`lofi` · `synthwave` · `dkc` · `vangelis` · `acid` · `plastikman` · `jungle`

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
node harness/mk2_test.js                                    # 96 seam checks
node harness/mk2_ui.js                                      # 24 checks, real browser
node harness/mk2_blend.js                                   # 10 checks, blend sliders
node harness/mk2_snapshot.js check harness/mk2_baseline.snap
node harness/probe_voices.js                                # every voice fires, none silent
node harness/mk2_midi.js                                    # 20 checks, MIDI port

node harness/mk2_roll.js 1                                  # THE test that matters: read the notes
```

`harness/README.md` lists the rest — the probes for the comp, the harmony, the
cymbals, every knob on every machine, and whether the genre outweighs the seed.

## Design laws (the short version)

- **Honesty above all.** If you have not measured it, say so. If a test passed,
  say which test. Mark guesses `[GUESS]`. A green checkmark you did not earn
  costs more than a bug you reported.
- **One owner per property.** If two places can write it, it has no owner.
- **No correcting passes.** Constrain the next choice; never repair the last one.
- **Seam checks throw.** `composeSong` proves its own output every song.
- **Provenance on every constant** — `[corpus:…]`, `[theory]`, `[EAR]`,
  `[GUESS]`. A provenance that does not match its constant is *worse* than none,
  because it stops anyone checking.
- **When a measurement surprises you, suspect the measurement first.**
- **The user's ears are the final judge.** Ship the file; do not render songs at
  them.
