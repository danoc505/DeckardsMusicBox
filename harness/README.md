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
node harness/mk2_test.js                              # the seam checks
node harness/mk2_ui.js                                # the panels, real browser
node harness/mk2_blend.js                             # the blend sliders
node harness/mk2_snapshot.js check harness/mk2_baseline.snap
node harness/probe_voices.js                          # every voice fires, none silent
node harness/mk2_midi.js                              # MIDI via a stub port
```

State at `af17de6` (build `2026-08-03o`): **118 / 26 / 10 / IDENTICAL /
0 threw, 0 silent / 20.**

**The counts in that line date the moment they were measured and nothing
keeps them true.** A check count that disagrees with this file is this file
being old, not the battery being broken — the batteries themselves say what
they ran. `docs/HANDOFF-MK2.md` carries the same table and is kept current
with it.

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
| `probe_matrix.js [genre]` | **every crossing of the grid moves air** — each one rendered twice and measured as a DIFFERENCE SIGNAL, plus the dub drop (dry closed, send open). **Slow — ~20 min a genre** |
| `probe_render_determinism.js` | the same events rendered three times null out. Written after a feedback cycle in the graph cost the renderer its repeatability at gain 0 |
| `probe_wiring.js` | **which genre actually reaches what was added.** A table, not a pass/fail. Found `preDelay` connected to NOBODY for two builds |
| `probe_kaoss.js` | the pad reaches live sound, and by how much, per genre |
| `render_audio.js` + `test_audio.py` | output assertions on rendered excerpts. **15 of them fail today and 13 are one stale check** — `docs/BACKLOG.md` §1 before you "fix" anything here |

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
3. **Anything that LISTS what the program contains will go stale.** Four times
   now, three of them in one session: the seam scanner's read-detection;
   `probe_matrix`'s column names, twice (a hardcoded `(Mix|Echo|Room)` died at
   FLANGE, and its replacement — pulling names out with `[A-Z][a-z]+` — died at
   DP4, because "DP4" has a digit in it); and `probe_wiring`, which had no
   barberpole column the build after one existed. **Derive it from the
   declaration.** `MK2.MATRIX`, `MK2.racks()` and `MK2.INSTRUMENTS` are exported
   for exactly this, and a list written out by hand here is a bug with a
   commit date on it.
4. **Ask the question of the thing, not of the declaration.** The first derived
   version of `probe_wiring`'s FX columns read each genre's `space.feeds` and
   reported the ROOM as used by two genres, when all seven use it — keys and
   lead arrive open there whatever a genre declares. A declaration says what
   was asked for; the crossings say what happened.
