# harness — everything that holds the program to a number

Every tool here reads **`../Deckards Orchestrator MK2.html`** directly. There is
no build step and nothing to install: each one extracts the single `<script>`
body, evaluates it with browser stubs, and asks the shipped program questions.
The browser-driven ones use the Playwright + Chromium already in `node_modules`.

*This file used to describe MK1 — `00_theory.js`…`13_flip.js`, `conduct()`,
`improvise()`, and a `build_engine.py` that reconstructed a runnable bundle.
None of that exists any more. The seven probes that depended on it were
confirmed dead (they `require("./run/engine_bundle.js")` and call `conduct`)
and deleted, along with `build_engine.py` and `tests/`. MK1 itself is still
here as `../Improv Machine playable_BETA 0.1.html`, frozen — for reading
rather than running.*

## The five-minute battery — run this before any claim

```sh
node harness/mk2_test.js                              # 96 seam checks
node harness/mk2_ui.js                                # 24 checks, real browser
node harness/mk2_blend.js                             # 10 checks, blend sliders
node harness/mk2_snapshot.js check harness/mk2_baseline.snap
node harness/probe_voices.js                          # every voice fires, none silent
node harness/mk2_midi.js                              # 20 checks, MIDI via a stub port
```

State at `fcc3c50`: **96 / 24 / 10 / IDENTICAL / 0 threw, 0 silent / 20.**

`mk2_midi.js` flakes about one run in five — its checks are wall-clock ("did 40
clock ticks arrive in 2.5 s"). One red run is not a regression; it is also not
fine, and the fix is to wait on counts rather than on durations.

## Reading the music

| tool | what it prints |
|---|---|
| `mk2_roll.js <seed> [--genre g] [--song] [--mid out.mid] [--blend a:50,b:50]` | **the test that matters** — the note grid, chords, pocket, accent/slide, pins |
| `probe_comp.js [seeds]` | how the comp is voiced: simultaneity, onsets/bar, inner movement, span |
| `probe_theory.js` | the music laws off the notes: out of key, NCT, chord-under-bass, unisons |
| `probe_harmony_neo.js [seeds]` | chromatic chords and voice-leading distance, per genre |
| `probe_pull.js [seeds]` | does the genre outweigh the seed? Between- vs within-genre variance |
| `probe_arc.js`, `probe_build.js`, `probe_rule_of_three.js` | the shape of the record over time |

## Proving a refactor is a refactor

```sh
node harness/mk2_snapshot.js check harness/mk2_baseline.snap
node harness/mk2_snapshot.js write harness/mk2_baseline.snap   # ONLY with a deliberate music change
```

It hashes events, form and arrangement **separately**, which is how you tell a
melodic change from a structural one. **If you change the music on purpose,
rewrite the baseline in the same commit and say so in the message.**

## Is the published build this build?

```sh
node harness/mk2_stamp.js check     # also runs inside mk2_test.js
node harness/mk2_stamp.js write     # after bumping the stamp AND republishing
```

This exists because the published artifact was once three program commits behind
while both files carried the identical stamp. `mk2_build.json` records what was
published and where.

## The sound

| tool | what it measures |
|---|---|
| `probe_voices.js` | every voice fires and none is silent — the cheapest real check here |
| `probe_controls.js [machine]` | every knob on a machine reaches the sound. **Slow — the TR-1000 is ~40 min.** Name one machine |
| `probe_cymbals.js` | the harsh band (2–6 kHz) in absolute terms **and** as a share |
| `probe_chains.js`, `probe_desk.js`, `probe_faders_down.js`, `probe_303.js` | routing, the desk, the faders, the 303 |
| `render_audio.js` + `test_audio.py` | output assertions on rendered excerpts |

## Samples

```sh
python3 harness/make_sample.py <file.wav|file.aif> --name kick --rate 22050 \
        [--max-sec 1.0] [--pitched]
```

Reads WAV **and** AIFF, trims, downsamples, mixes to mono 16-bit, preserves the
original peak as `pk` so a kit keeps its recorded balance, and with `--pitched`
detects the root note and reports a confidence. It prints a payload to paste
into the HTML — **nothing from any sample library is committed to this repo.**

## Two rules that keep being learned here

1. **When a measurement surprises you, suspect the measurement first.**
   `probe_controls.js` took twelve setup corrections before its output could be
   trusted; handoff §3 lists all twelve. This very cleanup nearly deleted
   `probe_rule_of_three.js` because a grep for "Error" matched the word "cannot"
   in one of its legitimate findings.
2. **Check the ruler fits the thing.** A 30 ms attack averaged over 4 seconds is
   nothing, and a share can rise while the absolute level falls. Report both.
