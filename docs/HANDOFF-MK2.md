# HANDOFF — Deckard's Orchestrator MK2

*Written 2026-07-29 on branch `claude/code-review-6jd9cz`, at commit
`02906b7`. For whoever picks this up next. Read this whole file before you
touch the HTML.*

---

## 0. The one rule that matters

**Honesty above all.** This project's history is a string of confident "fixed"
claims that turned out to be false, and that is the single most expensive thing
that has happened to it. If you have not measured it, say you have not measured
it. If a test passed, say which test. If something is a guess, mark it `[GUESS]`.
A green checkmark you did not earn costs more than a bug you reported.

Corollaries that have already bitten, twice each:

- **You do not have ears.** Audio renders prove nothing to you. The test that
  matters is `harness/mk2_roll.js` — the printed note grid — and the `.mid`.
- **The user's ears are the final judge.** Do not render songs for them unless
  asked; they have explicitly said it is a waste of effort. Ship the HTML, they
  will listen.
- **ALWAYS READ THE NOTES.** Reading the printed roll has found defects no
  spectrum analysis ever would: a counter line that was a parallel harmoniser, a
  bridge with an identical drum kit, metronome hats, a bass that ignored its
  genre, 1520 notes silently missing from the `.mid`.

---

## 1. What this is

**One self-contained HTML file** — `Deckards Orchestrator MK2.html` — that
composes and plays complete generative songs. No server, no CDN, no build step,
no dependencies. That property is not a nicety; it is what makes the program
usable at all, and it is why **VSTs are impossible here** (a VST is a compiled
native binary that a host process loads; a browser cannot load one and there is
no host). What we *can* use is open-source **work**: permissively-licensed data
(the mda ePiano bank, MIT, is embedded) and published **analysis** of hardware
(Nuked-OPN2's envelope arithmetic, Stinchcombe's 303 measurements, the CS-80
filter teardown). GPL-3 code — JS80P, mda-lv2 — cannot be vendored without
relicensing the whole file. See `docs/LICENSING.md`.

The file is ~1.4 MB: roughly 2,900 readable lines plus one 1.1 MB base64 line
(the ePiano sample bank). Editors that try to soft-wrap that line will hang;
use `sed -n 'A,Bp'` / `Read` with offsets rather than opening it whole.

### Do not write Python patch scripts

Earlier sessions edited the HTML by writing throwaway Python scripts into a
scratchpad that did string substitutions. It works, but it is confusing to
anyone reading the session and it puts a layer between you and the file. **Edit
the HTML directly.** Nothing in `/tmp/.../scratchpad/*.py` is part of the
program and none of it is checked in.

---

## 2. The architecture, and the laws it is under

Six stages. Each one `Object.freeze`s its output. **There are no correcting
passes** — MK1 had a "ghost pass" that fixed up violations after the fact, and
removing that idea is the central reason MK2 exists.

| # | Stage | Owns |
|---|-------|------|
| 1 | CHART | seed, genre, rig, **picks**, root, mode, tempo, keysChar, tape |
| 2 | FORM | the section sequence and its demands |
| 3 | MATERIALS | **every pitch.** Pitch is final at the end of stage 3 |
| 4 | ARRANGEMENT | which material each section plays, and how stripped |
| 5 | PERFORMANCE | **timing and gain**, each written by exactly ONE formula |
| 6 | SOUND | who is holding the instrument, and what the room is |

**The laws:**

1. **One owner per property.** If two places can write it, it has no owner. The
   voice field is written in exactly one place (stage 5, through
   `voiceFor()`). Gain is one expression. Timing is one expression.
2. **Law 4 — a genre is parameter tables only.** No code in stages 2–5 may
   contain a genre name or branch on one. If you find yourself writing
   `if (genre === "jungle")`, the thing you want belongs in the `GENRE` table.
3. **Determinism.** No `Math.random`, ever. Randomness comes from
   `stream(seed, "name")` named substreams, and **draws execute
   unconditionally** — a draw inside an `if` starves every later draw on that
   stream and silently moves songs you did not touch.
4. **Seam checks THROW.** `composeSong` proves its own output at the end. A
   violation is a crash, not a warning.
5. **Provenance.** Every constant carries a mark: `[corpus:<source>]`,
   `[theory]`, `[EAR]`, `[GUESS]`. A bare magic number is a bug. A provenance
   that does not match its constant is *worse* than none, because it stops
   anyone checking — that exact defect was found and fixed in the headroom
   comment.
6. **A rig changes WHO plays, never WHAT is played.** `composeSong(1,"band")`
   and `composeSong(1,"sega")` are the same performance by two bands.

### Determinism has a hard limit you must know

**Chrome's `OfflineAudioContext` is NOT bit-reproducible.** Measured: 1–3 LSB of
difference on up to 21% of samples between two renders of identical input. So a
WAV hash can never be the determinism test. The determinism test is the
**event list** — see `mk2_snapshot.js`.

---

## 3. The test harness — what to run, and what each one proves

Run all of these before you claim anything.

```bash
node harness/mk2_test.js                              # 39 seam checks
node harness/mk2_snapshot.js check harness/mk2_baseline.snap 300
node harness/mk2_roll.js 1                            # THE test that matters
node harness/mk2_roll.js 1 --song                     # full arrangement
node harness/mk2_roll.js 1 --mid                      # .mid round-trip check
```

- **`mk2_test.js`** — 39 assertions over composition seams: per-genre loops,
  "the counter is a line not a harmoniser", "the bridge is a departure", "the
  bass styles differ", "the drummer uses the toms", "the .mid carries every
  note". Currently **39 passed, 0 failed**.
- **`mk2_snapshot.js`** — SHA over every event of every seed. This is how you
  prove a refactor is a refactor. ⚠️ **Pass `300`** — the baseline holds 300
  seeds and the script defaults to 200, which reports a false "CHANGED".
  Current state: `IDENTICAL — 300 seeds, not one note moved`.
- **`mk2_roll.js`** — prints the material as an ASCII grid plus note tables,
  a DERIVATION section (measured relationships between materials) and THE
  POCKET in milliseconds. **Read this before and after every composition
  change.**

The audio harness (`render_audio.js` / `test_audio.py`, 515 output assertions)
exists and works, but the user does not want songs rendered for them. Use it to
measure, not to deliver.

---

## 4. What has been done

### The composition side

- **Six-stage pipeline complete**, seam-checked, deterministic per
  `(seed, genre, rig, picks)`.
- **Three genres in the `GENRE` table:** `lofi`, `synthwave`, `dkc`. Each
  carries ~30 fields — tempo bands, modes, rig weights, form grammar,
  progressions, registers, groove (swing, dilla displacement, jitter, push),
  kit (ghost placement, open-hat spots, flourishes, toms, variants), counter
  style, bass style, ostinato, space, kick voicing, drum drive, gate.
- **Rigs:** `band`, `sega` (YM2612 + PSG + DAC), `neon` (CS-80 comp).
- **A full tom kit** — 12"/14"/16" — and a **gated reverb** built the way
  Padgham/SSL actually did it: a compressed bright room, then a hard gate
  (hold ~150 ms, release ~15 ms). The compression is *half the sound*; without
  makeup gain the whole effect was inaudible, which is how the first two
  attempts failed. The drummer's tom appetite is a genre parameter.
- **`MK2.toMidi(song)`** — SMF type 1, 960 PPQ, one track per role.
  Round-trip-verified against the event list in the seam battery.

### The sound side

- **Drum bus:** `bus.drums → drumDrive → drumPre(0.5) → tanh(3.6x) →
  drumMakeup(1/1.8) → mix`. The makeup exists because inserting the saturator
  made every drum 5.1 dB louder — drive must be a *timbre* control, not a
  loudness control. That lesson is applied again inside the 303.
- **Voices:** acoustic kit, SEGA DAC/PSG kit, sub bass, YM2612 FM
  (bass/keys/lead/counter), Rhodes (mda ePiano port), Wurlitzer, CS-80.

### The instrument rack — this session's work

- **`INSTRUMENTS`** — 11 machines across three slots, each declaring its own
  controls with range, default, unit, and *what the number means*:
  - drums: `kit`, `tr808`, `segakit`
  - bass: `subbass`, `tb303`, `chipbass`
  - keys: `rhodes`, `wurly`, `mellotron`, `cs80`, `chipkeys`
- **TR-808**, built as circuits because that is what it is: bridged-T BD whose
  decay reaches 1.6 s, 2-oscillator + noise SD balanced by SNAPPY, six
  inharmonic squares for the hats (CH and OH are the *same* circuit at two
  decays), bridged-T toms.
- **TB-303**: two cascaded biquads — the filter is **four-pole, 24 dB/oct**;
  Roland's "18 dB" is marketing and Stinchcombe measured −23.9 dB/oct four
  independent ways — with **resonance in section one only**, because two
  high-Q sections multiply their peaks into a sine oscillator instead of a 303.
  Overdrive with makeup, because a stock 303 does not self-oscillate and on
  record the squeal is always into distortion.
- **Mellotron**: three tape sets, wow *and* flutter (two different mechanical
  faults), tape hiss, and the hard 8-second stop when the strip runs out.
- **The Wurlitzer is now its own instrument** rather than a branch inside
  `V.keys`, so the rack can name either keyboard directly.
- **`voiceFor(chart, lane)`** — the rig answers unless a machine has been put
  in that slot. `picks` is frozen into the chart as an **input to stage 1**,
  exactly like the rig.
- **The UI**: three slot pickers, and under them the front panel of *only* the
  machines those pickers chose. The panel is generated from the declaration —
  **there is no per-machine UI code**, so adding an instrument adds its panel.
  A slider writes straight into `PARAMS`; voices read `PARAMS` when they next
  fire, so a knob moves on the *next* note and never on one already scheduled.
- **Ownership chain**, one-directional, one owner per hop:
  `GENRE table → applyRack → PARAMS → soundOf → setSpace → graph`.
  `applyRack` only reloads when the genre or the machine changed, so a knob you
  moved survives pressing "new song". Each panel has a "reset to <genre>"
  button that forces a reload.

**Verified after the rack landed:** 39/39 seam checks, snapshot IDENTICAL over
300 seeds, page loads with zero errors, all three slots switch machines live and
every new voice dispatches and renders.

---

## 5. What needs to be done — in priority order

### 5.1 The 303 has no accent and no slide *(highest priority)*

`V.acid303` reads `ev.accent` and `ev.slide`. **Stage 5 never writes either
one.** Grep confirms it: the only occurrences are inside the voice. So today,
picking the TB-303 gives you a 303 with the two things that make it a 303
switched off — accent (louder + deeper filter envelope + *forced short decay*,
which is why an accented step sounds like a different note rather than the same
note louder) and slide (portamento from the previous step).

This is a **composition** change, not a sound change: a `bassStyle: "acid"` in
the `GENRE` table that draws accent and slide flags per step from named
substreams, written into the note in stage 3 and carried into the event in
stage 5. It will move the snapshot for any genre that uses it — that is
expected and correct; re-baseline deliberately, do not paper over it.

### 5.2 The step sequencers the user asked for

The user's request, verbatim in intent: *a TR-808 UI for drum patterns and
play, and under it a 303 bass synth UI, used for bass programming.* The rack and
the panels are done; the **16-step grids are not**. What is needed:

- An 808 grid: 16 steps × the lanes the machine declares, with the program
  filling it from the composed drum part and the user able to toggle steps.
- A 303 grid: 16 steps with note, accent, slide and gate per step — which is
  exactly the data 5.1 introduces, so **do 5.1 first** and the sequencer becomes
  a view onto it rather than a second source of truth.
- Decide honestly where the edited pattern lives. A user-edited pattern is not
  a seed-derived one; it must not pretend to be. Simplest honest model: an edit
  pins that lane's pattern into `chart.picks`-like input territory, and the roll
  prints it as pinned.

### 5.3 The remaining four genres

Three of seven exist. Still to build, each as a `GENRE` table entry with
researched parameters and no code branches:

| genre | notes already gathered |
|-------|------------------------|
| Acid house | needs the 303 work in 5.1; 808/909 kit; 120–130 bpm |
| Plastikman minimal techno | `ev.morph` automation design exists |
| UK jungle | **design failed, needs redoing** — breakbeat chopping, half-time, sub bass |
| Blade Runner / Vangelis | CS-80 + ribbon exist; design exists, not wired to a genre |

Research lives in `docs/genre-research/*.md` — **seven files, all flagged
unverified.** Several verification passes died on a weekly rate limit. Verify
before trusting; the flags are there for a reason.

### 5.4 Genre identity, for all seven

The user's framing, which is the right one: *"lofi hip hop is defined by more
than macro constraints on sound — it's the kind of chords, the often sparse
keys; synthwave is influenced by dark new wave, Blade Runner, 80s and future;
DKC was building atmosphere."* This has been partially delivered for lofi,
synthwave and DKC (chords, registers, counter style, bass style, ostinato,
groove). It has **not** been done from artist-level understanding for the rest,
and the drums research was never completed. Research the artists, then put the
findings in the table.

### 5.5 Smaller, known, honest

- `mk2_snapshot.js` defaults to 200 seeds but the baseline holds 300. Either
  change the default or make it read the file's length. It currently reports a
  false CHANGED to anyone who runs it the obvious way.
- `makeChart` cannot pin `rig: "neon"` from the UI — the guard only accepts
  `"band"` and `"sega"`. The `neon` rig is reachable only by genre draw.
- `harness/mk2_render.js` takes a genre argument but not `picks`.
- `INSTRUMENTS.segakit` maps toms to the acoustic `tom1/2/3`; the Mega Drive
  has no tom sample. That is a documented stand-in, not an oversight — but if
  it ever sounds wrong, that is why.

---

## 6. Things that have already been tried and were WRONG

Do not re-litigate these. Each was "fixed", then refuted by measurement.

- **The fill/`emptyLastBar` collision.** The proposed fix made the empty bar's
  hat *louder* (0.34 → 0.53). Reverted.
- **The swing "bug".** The shipped model is correct 8th-note swing. The
  "fix" was wrong. Reverted.
- **The Rhodes muffle.** `mdaEPiano.h` declares `f0`/`f1`/`ff` and `noteOn`
  computes them — but `processReplacing` **never reads them**. The muffle
  belongs to the sibling instrument (`mdaPiano.cpp` line 337). Porting it here
  filtered the Rhodes to −78 dB above 3.5 kHz. Vestigial fields in a source
  file are not features. Removing it returned 16.3 dB.
- **Linear FM in WebAudio gives phase deviation in RADIANS, not cycles.** The
  missing 2π cost 16 dB; fixing it gained the chip bass 22.6 dB at 1.5–3.5 kHz.
- **`const end = p + u32()`** reads `p` before `u32()` advances it. Split into
  two statements.
- **`pkill -f chrome-linux` kills your own shell** — the pattern matches your
  own command line.

---

## 7. Operational constraints

- **Branch:** develop and push **only** on `claude/code-review-6jd9cz`.
- **Commits** must be authored `Claude <noreply@anthropic.com>` — a stop hook
  enforces this and will reject anything else.
- **No pull requests** unless the user explicitly asks for one.
- **Push** with exponential backoff on network failure (2s, 4s, 8s, 16s),
  `git push -u origin claude/code-review-6jd9cz`.
- **Never commit downloaded corpora.** `corpus/` content stays local.
- **Seed 1 is the test seed.**

---

## 8. Where to look

| file | what it is |
|------|-----------|
| `Deckards Orchestrator MK2.html` | the program. Everything. |
| `Improv Machine playable_BETA 0.1.html` | **MK1.** Its synthwave synth and drums sounded good — worth reading before redoing either. |
| `docs/MASTERDOC-REBUILD.md` | the constitution |
| `docs/ROADMAP-MK2.md` | the schedule |
| `docs/LICENSING.md` | what may and may not be vendored |
| `docs/SYNTH-RESEARCH.md` | CS-80, filter topologies |
| `docs/genre-research/*.md` | seven genres, **all unverified** |
| `harness/mk2_roll.js` | the test that matters |
| `harness/mk2_test.js` | the 39 seam checks |
| `harness/mk2_snapshot.js` | proof that a refactor is a refactor |
