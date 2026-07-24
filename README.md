# Deckard's Orchestrator — the Improv Machine

A generative-music instrument that composes and plays complete songs — drums, bass,
chords, and melodies — across eight genres, and can chop a dropped-in record into the
band. It ships as **one self-contained HTML file**: no server, no build step, no
internet. Open it in a browser and press play.

```
Improv Machine playable_BETA 0.1.html   ← the whole program. Double-click to run.
```

## What it does

Four engines (bass, harmony, lead, drums) enter in a random order and each *listens to
the others* as it plays, refereed live by music-theory law. Nothing is baked in except
that physics: hard constraints reject invalid material, soft tendencies only nudge the
randomness, and a "ghost" corrector cleans up the seams. Same seed → same song; a new
seed explores a new one. It now also **judges its own output** and keeps the best of
several candidate seeds (best-of-N).

The material it recombines is drawn from **copyright-free / open symbolic corpora** —
Bach chorales, pre-1930 public-domain jazz and ragtime, de-identified jazz-solo phrasing,
and thousands of folk melodies — decomposed into abstract musical dimensions (rhythm ⟂
contour ⟂ harmony ⟂ structure) and recombined under theory law. See `docs/LICENSING.md`.

## Layout

| Path | What's inside |
|---|---|
| `Improv Machine playable_BETA 0.1.html` | The shipped program — the single source of truth for the engine. |
| `corpus/` | Python scripts that ingest open music sources and build the embedded corpora. |
| `harness/` | Reconstructs a runnable engine *from the HTML* so the tools work headless. |
| `tests/` | The standing test suite (`tests.js`) and the note-roll reader (`print_roll.js`). |
| `docs/` | Genre research, corpus sources, licensing, the code review, and `reference/` art. |
| `docs/spec/` | The original project brief and instructions. |
| `docs/reference/` | Visual reference (the retrofuturism control-panel direction, etc.). |

## Running the tools

The engine lives inside the HTML, so the harness rebuilds a runnable copy first:

```sh
python3 harness/build_engine.py     # extracts the engine from the HTML
cd harness/run
node tests.js                       # the standing suite
node print_roll.js 11 8             # read the note-roll for seed 11, 8 bars
```

## Design laws (the short version)

- **Prime directive:** nothing baked in but music-theory physics. If a different seed
  can't produce a different valid result, something is hardcoded — and that's a bug.
- **Hard vs soft:** hard constraints *reject*; soft tendencies *weight*. Never confuse them.
- **Measure, don't guess:** claims are checked across many seeds against the real engine,
  not asserted from reading the code. The user's ears are the final judge.
