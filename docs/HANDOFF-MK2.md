# HANDOFF — Deckard's Orchestrator MK2

*Written 2026-07-29 on branch `claude/code-review-6jd9cz`, at commit `02906b7`;
revised the same day at `077e08b` after the rack was wired to the conductor and
the five named machines got their real front panels. For whoever picks this up
next. Read this whole file before you touch the HTML.*

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
7. **Every knob declares its kind, and the kind says who may touch it.** See
   below — this is what decides which controls the program rides.

### The conductor's contract — which knobs the program may move

The question "how should the program decide what to do?" needs a stated rule,
not per-genre improvisation. Every control in `INSTRUMENTS` carries a `kind`:

**The four timescales `motion` can express**, and a genre should think in all of
them:

| kind | timescale | what it is for |
|------|-----------|----------------|
| `plock` | within a bar | per-step detail — the acid p-lock |
| `lfo` | bars, free-phase or bar-locked | weather; nobody should be able to point at it |
| `section` | section to section | *categorical* — chorus is always +X |
| `gesture` | 1–2 bars into a fill or a peak | the hand on the dial over an arrival |
| `arc` | **the whole record** | where the song ENDS UP vs where it started |

`arc` was added last and it closed a real hole. Measured across 81 automated
controls *before* it existed: 3.7% of dial within a bar, 6.5% bar to bar, 12.0%
section to section — and 6.8% start-to-end, which was **incidental**, whatever
the free-running LFO phases and the section order happened to leave behind.
Nothing expressed "the record goes somewhere", because a `section` move is
categorical: the third chorus is identical to the first, and a nine-minute acid
record built that way arrives where it started. Wikipedia's definition of acid
house is literally an arc — the sound is made *"by raising the filter resonance
and lowering the cutoff frequency"* over the record — and Hawtin's Consumed is
*"a year of subtraction"* across an album side. With arcs in, acid's
`tb303.cutoff` travels **43% of its dial** from the top of the record to the
end, and dkc's `rhodes.tone` 25%.

| kind | meaning | may the conductor move it? |
|------|---------|----------------------------|
| `switch` | a discrete choice — the 303's waveform, the Mellotron's tape set | **no** — mid-song it is a different instrument, not a gesture |
| `voicing` | what the instrument *is* — kick body and level, tremolo rate, the CS-80's initial bend | **no** — automating it makes the instrument wander instead of the performance moving |
| `bus` | a gain **node** the whole kit passes through — drum drive, gate send | **yes, as a curve** — `rideBus()` writes an automation curve on the node across the song. Not per note. |
| `gesture` | what a player's hand is on — cutoff, resonance, brightness, decay, ensemble | **yes, per note** — through `P()`. This is what `motion` is for. |

Four seam checks enforce it, and together they close the loop:

- **every automated knob reaches the sound, at the note or on the bus**
- **every knob on every panel reaches the sound** — no control may be declared
  that no voice reads. (Four were, for as long as the rack existed: `subbass.cut`,
  `subbass.drive`, `chipbass.bright`, `chipkeys.bright`. They were drawn, they
  moved, and nothing happened.)
- **every knob the conductor can move is one some genre moves** — a gesture or a
  bus nobody rides is a knob the conductor is not using. Ten gestures and then
  twelve bus/kick controls were idle before this landed.
- **no switch or voicing control is automated** — the reverse error.
- **a genre's params name controls that exist** — no phantom parameters.
- **every value a genre declares actually reaches the panel.**
- **no genre inherits the previous genre's panel.**

**The last two exist because of the worst bug this rack has had, and it shipped
green.** `applyRack` walked the three *slots* and skipped any set to `"auto"` —
and `"auto"` means "whatever the rig names", which is most machines. So every
value a genre declared for a machine it reaches through the rig was thrown away:
**69 of them**, including `vangelis.params.cs80.initBend`, the initial pitch
bend that is the single identifying feature of that score. It read 0. The scoop
had never once happened, while the table, the commit message and the comment all
said it was the line that named the genre.

Fixing that half exposed the other: `PARAMS` is one global table, so a machine a
genre says *nothing* about keeps whatever the last genre left on it. Composing
Vangelis then synthwave left the CS-80 holding a 1.0 initial bend on every note
of a genre that never asks for one — **382 controls** carrying another genre's
settings. `applyRack` now loads every machine every time: the genre's value where
the table has an opinion, the machine's own default where it does not. The user's
hand is untouched either way, because a drag writes `TRIM` (an offset), not
`PARAMS`.

Nothing threw. Nothing failed. The panel showed a plausible number the whole
time. **If you change how parameters reach a voice, write the check first.**

The upshot, measured: **57 controls — 38 gesture, 10 voicing, 6 bus, 3 switch.
All wired; 46 set by at least one genre; 44 ridden by at least one.** The 13
never ridden are exactly the switches and voicings — by contract, not neglect.

**The bus gains were the last thing to move,** and they were the hardest,
because an AudioParam has no note to be read at. `rideBus()` samples the motion
plan one point per beat and writes `setValueAtTime` + a `linearRampToValueAtTime`
chain onto the node. Measured with byte-identical drum events rendered at
different song positions — so the only variable is where the plan is read —
lofi's kit is **+1.16 dB** in the chorus and synthwave's spans **5.7 dB** between
bridge and chorus. Peaks move by 0.1 dB across that span: riding the bus pushes
the kit further into the drum saturator, so it thickens rather than just getting
louder, which is what riding a bus into a driven desk actually does.

Two related fixes came with it: the acoustic kick now reads its own panel per
note (it used to read a snapshot `setSpace` took before anything was scheduled,
so all four of its voicing controls were frozen for the whole song), and
`kit.body` / `kit.gain` moved onto that panel instead of living only in the
genre's `kick` block where nothing could touch them. The gate's **hold** turned
out not to be a bus control at all — every hit reopens the gate and decides for
itself when the door slams, which is a gesture — so `openGate` takes the event
now and looks the hold up on whichever drum panel the plan names.

When you add a machine, give every control a `kind`. If it's a `gesture` or a
`bus`, some genre that hosts the machine has to ride it or the battery fails —
which is the point: it stops a panel growing knobs nobody uses.

**How much of the movement is arrangement-driven?** 92 motion terms across the
six genres: **59% section- or fill/peak-driven** (the arrangement tells the knobs
where the song is), 32% free-running LFOs, 10% per-step p-locks. The reverse
direction — knobs changing notes — is forbidden by the stage boundary and must
stay forbidden.

### Determinism has a hard limit you must know

**Chrome's `OfflineAudioContext` is NOT bit-reproducible.** Measured: 1–3 LSB of
difference on up to 21% of samples between two renders of identical input. So a
WAV hash can never be the determinism test. The determinism test is the
**event list** — see `mk2_snapshot.js`.

---

## 3. The test harness — what to run, and what each one proves

Run all of these before you claim anything.

```bash
node harness/mk2_test.js                              # 83 seam checks
node harness/mk2_roll.js 1 --genre vangelis           # any of the six genres
node harness/mk2_snapshot.js check harness/mk2_baseline.snap
node harness/mk2_roll.js 1                            # THE test that matters
node harness/mk2_roll.js 1 --song                     # full arrangement
node harness/mk2_roll.js 1 --mid out.mid              # .mid round-trip check
node harness/mk2_ui.js                                # 20 checks, in a browser
```

- **`mk2_test.js`** — 83 assertions over composition seams: per-genre loops,
  "the counter is a line not a harmoniser", "the bridge is a departure", "the
  bass styles differ", "the .mid carries every note", plus the rack, the motion
  and the pins. Currently **83 passed, 0 failed**.

  Two of these were rewritten when the new genres arrived, and the reason
  generalises: *"the drummer actually uses the toms"* and *"every genre's second
  voice actually sounds"* both applied a **flat threshold** — synthwave's
  drummer and synthwave's octave double — to every genre. They failed the moment
  a genre arrived with no drum kit at all. A flat threshold cannot tell "the
  genre wants little" from "the code delivers nothing", so both now read the
  genre's own declared `kit.toms.use` / `counter.density` and hold the program
  to it **in both directions** — which is what stops a genre buying a pass by
  declaring nothing. If you add a genre and a test fails, ask which of the two
  it is before you touch the table.
- **`mk2_snapshot.js`** — SHA over every event of every seed. This is how you
  prove a refactor is a refactor. It now defaults to however many seeds the
  baseline file holds, so the bare command is correct (it used to default to 200
  against a 300-seed baseline and report a false CHANGED). Current state:
  `IDENTICAL — 300 seeds, not one note moved`.
- **`mk2_roll.js`** — prints the material as an ASCII grid plus note tables, a
  DERIVATION section, THE POCKET in milliseconds, **accent and slide on the bass**
  (`>` accent, `/n` `\n` slide) with a "303 view" block per material, and
  **PINNED markers** under any lane-bar the user has programmed. Takes
  `--pins <file.json>`. **Read this before and after every composition change.**
- **`mk2_ui.js`** *(new)* — loads the shipped file in Chromium, clicks the step
  buttons, drags the knobs, presses play, reads back what happened. Every other
  harness eval's the `<script>` out of the HTML and never builds a DOM, so
  nothing about the front panels was provable before this existed. ~10 s.

The audio harness (`render_audio.js` / `test_audio.py`, 515 output assertions)
exists and works, and now renders WITH the motion plan at each excerpt's own
song position. The user does not want songs rendered for them. Use it to
measure, not to deliver.

---

## 4. What has been done

### The composition side

- **Six-stage pipeline complete**, seam-checked, deterministic per
  `(seed, genre, rig, picks)`.
- **Six genres in the `GENRE` table:** `lofi`, `synthwave`, `dkc`, `vangelis`,
  `acid`, `plastikman`. Each carries ~30 fields — tempo bands, modes, rig
  weights, form grammar, progressions, registers, groove (swing, dilla
  displacement, jitter, push, lane lean), kit (ghost placement, open-hat spots,
  flourishes, toms, variants), counter style, bass style, theme density,
  ostinato, space, kick voicing, drum drive, gate, machines, params, motion.
- **Rigs:** `band`, `sega` (YM2612 + PSG + DAC), `neon` (CS-80 comp),
  `nemo` (CS-80 + VP-330 + Prophet drone, no drum kit), `box` (808 + clap +
  303), `plastik` (808 + rim + sub drone + acid ostinato).
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

### The conductor, the motion and the panels — the session after that

Everything above described a rack the *user* drove. The composer drives it now,
and the machines have faces.

- **`GENRE.machines`** — the two seams `resolvePicks` and `applyRack` had been
  reading since the rack landed were both **empty**; no genre defined either, so
  the composer could not pick an instrument or set a panel. `machines` is a
  weighted list per slot, **drawn** on its own substream like the rig, so two
  lofi seeds can be a kit and an 808. `"auto"` is a legitimate outcome and every
  genre leaves room for it — auto is what keeps the RIG picker meaningful.
  Measured: 356 of 540 slots still fall through to the rig.
- **`GENRE.params`** — the genre's starting front panel per machine.
- **`GENRE.motion`** — the knobs move, and the song moves them. Four kinds, any
  mixture: `plock` (per step — Elektron's parameter lock), `section` (per section
  function), `lfo` (tempo-synced, optionally free-phase), `gesture` (one-shot on
  a fill or a peak). The genre declares RANGES; `makeMotion` draws one number per
  song per move on a substream keyed by machine, control and index — so movement
  is character, not chaos, and adding a move cannot shift a draw anywhere else.
- **A knob has three owners and they SUM:** `PARAMS` (genre base) + motion
  (composed) + `TRIM` (the user's hand, a signed offset), clamped to the dial.
  Summing is why the hand and the machine can both be telling the truth: grab a
  sweeping filter and it keeps sweeping, around where you put it.
- **Motion touches no note.** It reaches the sound through `P()` alone and
  derives its position by rounding `ev.tSec` to a sixteenth, so stage 5 needed no
  new field and the snapshot never moved.
- **Accent and slide** are written onto every bass note from their own
  substreams (handoff §5.1, done). The 303 finally behaves like one.
- **Pins** — a pattern typed on a machine's grid is an **input to stage 1**,
  frozen into the chart beside `picks`. Unit: one lane, one bar, one pattern.
  Seam checks run over pinned material like any other; the roll prints PINNED.
- **Five faithful front panels** — 808, 303, Mellotron, Rhodes, Wurlitzer — with
  drag-to-turn knobs carrying **two indicators**: the bright pointer is where you
  have it, the dim orange dot is where the song has it *right now*. The panel is
  DATA (`INSTRUMENTS[m].panel`), so a machine without one still falls through to
  the old generic slider list and nothing regressed.
- **The 808 and 303 have their sixteen steps**, with pattern (A/B/C/fill) and bar
  (1–4) selectors — which is both the hardware's pattern-group-then-number and
  the actual shape of the material family, since A, Avar and B share one drum
  pattern. Editing recomposes and playback resumes at the same song second.

**Verified:** 57 seam checks, 20 UI checks in a real browser, 515 audio
assertions, snapshot IDENTICAL over 300 seeds. The one deliberate snapshot move
was `GENRE.machines`: 592,057 events compared field by field, `voice` the only
one that changed (93,288 events, all machine swaps), everything else zero.

---

## 5. What needs to be done — in priority order

### 5.1 ✔ DONE — the 303 has its accent and its slide
### 5.2 ✔ DONE — the step sequencers, editable and pinned

Both landed. See §4. Kept here so the numbering in older notes still resolves.

### 5.0 Four machines have knobs that do NOTHING *(highest priority now)*

`cs80`, `subbass`, `chipbass` and `chipkeys` declare front-panel controls that
**no voice reads**. Their sliders move and nothing happens. This is a lie a user
cannot detect by listening, which makes it worse than a missing feature.

State of it:

- Each such control is marked `dead: true` in its declaration, every panel that
  has one prints *"declared but NOT WIRED to the voice — moving it does nothing
  yet"*, and a seam check (*"every automated knob is one a voice actually
  reads"*) scans the shipped source for the reads voices actually perform and
  fails if a genre automates one. The problem is contained and visible.
- It is **not fixed.** The CS-80 is where it stings: `brilliance` and `ring mod`
  are its two signature controls and both do nothing today, and the CS-80 is the
  synthwave rig's comp instrument.

Wiring them is mostly mechanical — read through `P(g, ev, machine, key, dflt)`
like the five wired machines do — but each one is a *sound* change and wants an
A/B before it merges. Do the CS-80 first; it plays on every synthwave song.

### 5.2b The 808's hi-hat may be too dark

A/B measured, synthwave seed 2, same notes, only the drums machine changed:
above 6 kHz the acoustic kit reads **2.73–3.78%** and the TR-808 reads
**0.11–0.13%** (a kit-free excerpt reads 0.00–0.03%). So the 808 kit is present
— four times its own silence — but **twenty-five times darker** than the
acoustic one on top. A real 808 hat is bright and cutting.

The circuit is the right shape (six inharmonic squares through a high-pass, CH
and OH the same circuit at two decays). Whether it is bright *enough* is an ear
question no battery can answer. Same for the low end: the 808 puts **four times**
the sub of an acoustic kit under an identical performance (29.4–32.8% vs
6.5–7.8% under 60 Hz). Both numbers are in `test_audio.py` with their
provenance, and both thresholds branch per-machine so a correct 808 is not
failed for being an 808. **Listen before changing either.**

### 5.2c Motion values are taste, and marked as such

Every number in the three `GENRE.motion` tables and most of `GENRE.machines` and
`GENRE.params` is `[EAR]` or `[GUESS]`. They are defensible and they are not
measured. They are the first thing to change if the ear disagrees. In
particular the weights that decide how often lofi reaches for an 808 (3 in 10)
and how often synthwave reaches for a 303 (1 in 2) are pure taste.

One rule the tables should keep: **a genre describes every machine it can
plausibly host, not only the ones it draws** — a hand-picked machine whose knobs
sit dead still is worse than one that is not offered.

### 5.3 All seven genres exist

`lofi`, `synthwave`, `dkc`, `vangelis`, `acid`, `plastikman`, `jungle`.

**Jungle needed a subsystem, not a table**, because its identity is a chopped
break and everything else in this program plays lanes. What was built:

- **`AMEN`** — a transcription of the four-bar break, following Ethan Hein's
  thirteen-step construction exactly, with each step named in the comment.
  **Nothing is sampled**: there is no recording in the file and none is
  downloaded. The program synthesises the break from the grid.
- **`makeBreak`** (inside `buildGraph`) — hand-written DSP straight into a
  `Float32Array`, because `buildGraph` is synchronous and an
  `OfflineAudioContext` render is not. Kick, snare, ghost and cymbal, then a
  Schroeder network (4 combs → 2 allpass) for the 1969 room. One seeded RNG,
  so the same graph builds the same break every time.
- **`V.brk`** — plays one slice: offset, playback rate (the tempo ratio, which
  *is* the pitch shift), reverse, tone, low cut, tail.
- **`buildBreak`** (stage 3) — the chopper. Rearranging a break is writing the
  part, so it is a composition stage. Onsets come from the source's own hits;
  edits are `jump`, `stutter`, `reverse`, `thin`.
- **`gmForSlice`** — the `.mid` exports a chopped bar as the drums it is
  actually made of, by looking up what the source slice strikes.

**Why it is a buffer and not notes**, in the source's own words: *"You can't
adequately represent the Amen via MIDI or music notation. Its timbre is doing as
much musical work as the placement and timing of drum hits."* A chopped break
sounds chopped because you hear slice boundaries and room tone running across a
cut. Emitting kick/snare events instead gives fast drum programming.

**Measured:** all 39 transcribed kick/snare/ghost onsets are present in the
rendered buffer; 35 clear a crude envelope-rise detector at a mean error of
0.7 ms, and the four that do not are measurably there (−9 to −21 dB against a
quietest-detected hit of −19.1 dB) — three are ghost pickups sitting inside the
previous hit's decay, which is what a ghost is. The detector is the weaker
instrument, not the buffer.

**What reading the roll caught that no render would have**, and this is the
third time this has happened: the chopper's `jump` picked a target bar and then
a step from the *current* bar's onset list, so chops landed on steps where the
source has nothing — bars opening on room tone instead of a transient. The
`source` row in `mk2_roll.js` shows what each slice actually strikes, which is
how it was visible at all. Fixed to draw from the target bar's own onsets.

**Honest limits of this genre**, worth keeping in the table's comments:

- The break is synthesised, so it does not sound like Gregory Coleman playing.
  His microtiming is the thirteenth step of the construction and no grid holds
  it. What is reproduced is the *arrangement* of the break and the act of
  cutting it up.
- `groove.swing` stands in for that microtiming and is the wrong shape for it —
  a global ratio is not a drummer's placement.
- The tempo band `[160,176]` is `[EAR]`. No corpus of measured jungle BPMs was
  gathered; do not read it as one.

### 5.4a Plastikman's bass, and the shape of a research error

Worth reading before you write another genre table, because the mistake is easy
to repeat. The research said two things: *"many of the 303 lines were pitched up
an octave"* and *Consumed* is *"driven largely by deep, rumbling basslines."* I
built a sub **drone** on the bass lane and put the 303 on the ostinato — keeping
the octave and losing the instrument. The drone restruck only when the chord
changed, and this genre's chord never changes, so **seed 1 had three bass notes
in four bars** under a record described as bass-driven.

The primary source is unambiguous: *"one of the core fundamental sounds of
Plastikman has always been Roland TB-303 basslines; it's on nearly every track
except for a couple of drum things."* Both facts are true at once — the 303
plays the **bass**, a second voice of it sits an octave and a half up as the
**figure**, and the very bottom is the **kick** (*"basslines in minimal tend to
be carried by the kicks, with the drums tuned to fill in the bottom end"*).

The fix brought one genuinely new mechanism, and it is sourced rather than
tasted: **`acidLine.avoidKick`**. *"Leaving the first 16th-note of every beat
empty is important to prevent clashing with the kick"* — under four-on-the-floor
that empties steps 0, 4, 8, 12 and the line rolls in the three sixteenths after
each kick. Acid house does **not** do this (its 303 sits on the downbeat), so
the flag is off by default and the genre that wants it asks.

**Measured afterwards**, because a C2 bassline next to a 0.60 s 808 kick is the
mix problem every one of those guides opens with: eight bars of seed 1 put
**50.4%** of energy under 60 Hz — and **taking the bass out raises it to 77.9%**.
The kick alone is 81.7%. The 303 line is what stops the genre being nothing but
sub; it does not cause it. Acid house measures 58.2% and was not touched.
Whether that is too much bottom is an ears question, not a number question — the
35% figure quoted elsewhere in this file came from a lofi/synthwave judgement and
should not be applied to a genre that is a kick.

### 5.4 Genre identity, for all seven

The user's framing, which is the right one: *"lofi hip hop is defined by more
than macro constraints on sound — it's the kind of chords, the often sparse
keys; synthwave is influenced by dark new wave, Blade Runner, 80s and future;
DKC was building atmosphere."* This has now been delivered for six genres
(chords, registers, theme density, counter style, bass style, ostinato, groove,
machines, params, motion). It has **not** been done for jungle, and the drums
research was never completed. Research the artists, then put the
findings in the table.

### 5.5 Smaller, known, honest

- ✔ `mk2_snapshot.js` defaulting to 200 against a 300-seed baseline — fixed;
  `check` now reads the file's length.
- ✔ `mk2_test.js` comparing event voices against thirteen names hand-copied into
  the harness — fixed; it asks `MK2.voiceNames()`, the shipped voice table.
- ✔ `mk2_roll.js`'s `.mid` round-trip check omitting the toms from its
  expectation, so it printed `*** MISMATCH ***` on every song containing one
  (11 on lofi seed 1, exactly the gap shown). The export was right the whole
  time. All three genres MATCH now.
- `makeChart` cannot pin `rig: "neon"` from the UI — the guard only accepts
  `"band"` and `"sega"`. The `neon` rig is reachable only by genre draw.
  **Still open.**
- `harness/mk2_render.js` takes a genre argument but not `picks` or `pins`.
  **Still open.**
- `INSTRUMENTS.segakit` maps toms to the acoustic `tom1/2/3`; the Mega Drive
  has no tom sample. That is a documented stand-in, not an oversight — but if
  it ever sounds wrong, that is why.
- A **bass pin belongs to the key it was typed in.** Change seed or genre and
  root/mode change, so its absolute pitches go out of key and stage 3 rightly
  throws. `newSong` catches that, drops the pitched pins, retries once and says
  so in the info line. Drum pins have no pitch and survive. If you ever want
  pins to survive a key change, they must store scale degrees, not pitches.
- The `kit` machine's bus/gate/kick knobs reach the graph through `soundOf` →
  `setSpace`, which happens once per render, so **those four are not
  automatable**. Every control on the five panelled machines is read per-note
  and is. Not a defect, but know it before adding motion to `kit.*`.

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
- **A slide is not "the previous note in the array".** DKC's pedal strikes its
  root and its octave double on the SAME instant; taking the predecessor
  literally read that octave as a 12-semitone slide into a note it is actually a
  CHORD with. It was most of DKC's slides — mean slide distance 10.8 semitones,
  an octave siren on every downbeat. The predecessor must be at a strictly
  earlier grid position. There is a seam check named exactly that.
- **A long decay is a loudness change.** Energy goes as amplitude squared TIMES
  duration, so synthwave's 808 at 1.05 s decay tripled the low end without
  moving a peak level and failed 18 audio assertions. Decay, drive and gate are
  timbre controls; if one of them changes how loud the thing is, it needs
  makeup. That is now three times this file has learned it (drum bus, 303
  overdrive, 808 decay).
- **Do not "fix" an audio threshold by raising it.** When the 808 failed the sub
  and air checks, the answer was not a bigger number — it was that the bar has
  to be the *machine's*, the same way the air floor was already the *rig's*,
  with both sides A/B measured on identical notes. Raising a global threshold to
  make a red line go green is how a battery stops protecting anything.

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
| `harness/mk2_test.js` | the 57 seam checks |
| `harness/mk2_snapshot.js` | proof that a refactor is a refactor |
| `harness/mk2_ui.js` | the panels, driven in a real browser |
