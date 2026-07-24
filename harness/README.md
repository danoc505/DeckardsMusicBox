# harness — make the standing tools runnable from the shipped HTML

The numbered source modules (`00_theory.js` … `13_flip.js`, `synth.js`), the corpora,
and the Python build scripts are **not checked into this repo** — only the built,
self-contained player HTML is. But `tests.js` and `print roll.js` `require()` those
modules, so as checked out they cannot run.

This harness reconstructs a runnable engine **from the HTML itself** (no uploads needed):
it extracts the single `<script>` body, prepends headless browser stubs (the engine is
browser-scoped), appends an export epilogue, and writes small shim modules matching the
`require()` names the tools expect. Nothing in the repo is modified; everything generated
lands in `harness/run/` (git-ignored).

## Run

```sh
python3 harness/build_engine.py
cd harness/run
node tests.js                 # the standing suite
node print_roll.js 11 8       # read a song's notes as a roll  (seed, bars)
node probe_nct.js             # measure the one unenforced HARD law (see ../../CODE_REVIEW.md)
```

## What to expect

- **The suite runs green on every music law.** Remaining failures are all *environmental*
  — absent `node_modules` (jsdom, pitchfinder, the MIDI lib), the un-checked-in sampling
  modules (`11_slicer.js`, `12_sample_notes.js`, `13_flip.js`), the corpora, and the OPN2
  driver. They are missing files, not regressions. See `../../CODE_REVIEW.md`.
- To run the sampling / external-referee tests too, drop the missing modules, corpora and
  `node_modules` into `harness/run/` and re-run.

## Caveat

This is a **static** reconstruction. It exercises the composition engine
(`conduct`/`composeSong`/`improvise`) exactly as shipped, but it cannot render audio, and
it is only as current as the HTML. If you regain the real module tree, prefer it — this
exists so the roll and the suite are never un-runnable again.
