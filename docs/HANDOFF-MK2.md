# HANDOFF — Deckard's Orchestrator MK2

*Written 2026-07-29 on branch `claude/code-review-6jd9cz` at `02906b7`; revised
at `077e08b` when the rack reached the conductor; revised again **2026-07-30 at
`4728512`**, after the control sweep and the non-chord-tone law. For whoever
picks this up next. Read this whole file before you touch the HTML.*

> **The container has rolled this clone back to an old commit three times in one
> session.** Twice mid-task. Nothing was lost because everything was pushed, but
> if `git log` shows a commit you do not recognise as HEAD, you have been rolled
> back — `git fetch origin claude/code-review-6jd9cz && git reset --hard
> origin/claude/code-review-6jd9cz` and check what you had uncommitted. **Commit
> and push early. Do not sit on work.**

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
- **When a measurement says something surprising, the first suspect is the
  measurement.** `harness/probe_controls.js` took **twelve** setup corrections
  before its output could be trusted — nine before it found a single real bug
  and three more after. Every real defect it reported was real; every *other*
  "dead knob" it reported was the probe measuring its own setup. §3 lists all
  twelve, because they are the twelve ways a measurement here goes wrong.
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

### The blend — elements of any genre in any other

`composeSong`'s genre argument takes a **name or a map of names to weights**.
Stage 1 resolves either to ONE table and freezes it onto `chart.table`, which is
what every stage below reads. That is what keeps Law 4 true under blending: no
stage learns a genre name, it reads a table, and whether that table was written
by hand or blended from seven is stage 1's business alone.

**The rule: average what is continuous, draw what is structural.** Three
operations cover the whole table:

| op | applies to | why |
|----|-----------|-----|
| `mix` | numbers, same-shape numeric arrays | tempo, gains, wet, densities, accent maps |
| `merge` | weighted tables `[[v,w],…]` | half lofi + half acid means the mode draw is lofi's weights at half plus acid's at half — the most natural blend in the file |
| `draw` | everything else | one genre owns the field, weighted |

**Drawing is not a compromise.** The identifying features are *switches*, and
half a switch is nothing. Vangelis IS `initBend: 1.0`; Plastikman IS
`flourishBar: -1`; jungle IS `chop`. Averaging `flourishBar` between −1 and 3
gives 1, which is neither genre and is musically nothing. Drawn instead, a 70/30
song makes a **definite choice on every element** — so any single song is
coherent, and you hear the blend across the parts and across seeds rather than
as a smear inside every part. A chopped break under a Rhodes, not a half-chopped
half-Rhodes.

**Two failure modes, both found by measurement on a naive blender first:**

1. **Integer domains.** `counter.intervals` are *scale steps*. Averaged, lofi and
   acid gave **−4.5**, `degMidi` indexed `MODES[mode][3.5]`, got `undefined`, and
   the pitch was NaN. Same class: `swingUnit 1.5`, `flourishBar 2.5`, every step
   position and bar length — and `tempo`, which only rounded its *offset* and
   announced a blend at `82.80000000000001 bpm`. Those fields are in `BLEND_DRAW`.
2. **Internal consistency.** Fields that only mean something together must be
   drawn from the same genre — `BLEND_GROUP`. The ostinato cell and the register
   set were drawn independently, so a song could get DKC's cell with lofi's
   registers, which have no `ostinato` band: **172 of 1890 blended songs threw**
   until they were grouped.

**Measured now: 1889/1890 pairs compose at 25/50/75, and all seven blended at
once composes 30/30.** The one failure is a genuine register collision, caught by
the seam check — a blend *can* fail, roughly one song in six hundred, and the UI
says which seed and why rather than silently reseeding.

The sliders are a **constrained simplex with locks**: move one to *v* and the
unlocked others give way in proportion to what they already had; if the locked
total is *L*, an unlocked slider clamps at *1 − L* rather than silently refusing;
if every other unlocked genre is at zero, the remainder is shared equally (without
that, dropping the only genre leaves weight nowhere to go and the sum breaks).
`harness/mk2_blend.js` drives all of that through the real DOM handlers — none of
it is visible from the note grid, because it happens before a note exists.

### Determinism has a hard limit you must know

**Chrome's `OfflineAudioContext` is NOT bit-reproducible.** Measured: 1–3 LSB of
difference on up to 21% of samples between two renders of identical input. So a
WAV hash can never be the determinism test. The determinism test is the
**event list** — see `mk2_snapshot.js`.

---

## 3. The test harness — what to run, and what each one proves

Run all of these before you claim anything.

```bash
node harness/mk2_test.js                              # 93 seam checks
node harness/mk2_roll.js 1 --genre vangelis           # any of the seven genres
node harness/mk2_snapshot.js check harness/mk2_baseline.snap
node harness/mk2_roll.js 1                            # THE test that matters
node harness/mk2_roll.js 1 --song                     # full arrangement
node harness/mk2_roll.js 1 --mid out.mid              # .mid round-trip check
node harness/mk2_ui.js                                # 24 checks, in a browser
node harness/mk2_blend.js                             # 10 checks, the blend sliders
node harness/mk2_roll.js 1 --blend lofi:50,jungle:50  # read a blended song
node harness/probe_voices.js                          # fire every voice
node harness/probe_theory.js                          # the music laws, off the notes
node harness/probe_controls.js [machine]              # every knob reaches the sound
node harness/mk2_stamp.js check                      # is the published build this build?
```

**The five-minute battery, before any claim:** `mk2_test.js`, `mk2_ui.js`,
`mk2_blend.js`, `mk2_snapshot.js check`, `probe_voices.js`. State at `4728512`:
**93 / 24 / 10 / IDENTICAL / 0 threw, 0 silent.** At `8a4f8db`: **95 / 24 / 10 /
IDENTICAL / 0 threw, 0 silent** — two rig checks added, see below.

### The build the user hears is not automatically the build you measured

**This cost three commits of work going unheard.** The published artifact was
byte-for-byte commit `0f3a0a9` while the repo was six commits on: no kitFilter in
the circuit, five drum voices not reading their channel tune/decay, the gate send
never reaching the hand, no non-chord-tone law. Every measurement in §5 was taken
on a program the user had never played.

It was invisible because **both files carried the stamp `build 2026-07-29r`** —
the one instrument built to tell a stale page from a broken program, standing
still through a day's work. A stamp that does not move is worse than no stamp,
for the same reason a wrong provenance is worse than none: it stops anyone
checking.

So the stamp is a **seam** now, not a habit — `harness/mk2_stamp.js`, recorded in
`harness/mk2_build.json`, run inside `mk2_test.js`. It fails on any program
change until you bump the stamp in the HTML and re-record, exactly the way a
moved snapshot fails: **not an error, a step not yet done.** Its three branches
were each driven to failure before it was believed.

It does not inspect the live artifact — it records what was published and hashes
what you have. It catches the *cause* and hands you evidence for the *symptom*.

**So: bump the stamp in the commit that changes the program, re-record, and
republish.** Same discipline as the baseline, and for the same reason.

- **`mk2_test.js`** — 93 assertions over composition seams: per-genre loops,
  "the counter is a line not a harmoniser", "the bridge is a departure", "the
  bass styles differ", "the .mid carries every note", plus the rack, the motion
  and the pins. Currently **93 passed, 0 failed**.

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

  The newest is **"a non-chord tone that is still sounding resolves by step"**,
  guarded at 20%. It is a **threshold, not a zero** — an escape tone and a free
  appoggiatura are real writing, and a line with no dissonance left in it is a
  line with nothing in it. §5.6 has the whole story.
- **`mk2_snapshot.js`** — SHA over every event of every seed. This is how you
  prove a refactor is a refactor. It now defaults to however many seeds the
  baseline file holds, so the bare command is correct (it used to default to 200
  against a 300-seed baseline and report a false CHANGED). Current state:
  `IDENTICAL — 2100 seeds, not one note moved` (one line per seed AND genre; it
  used to compose only lofi on every seed and say "300 seeds"). It hashes the
  events, the form and the arrangement **separately**, which is how you tell a
  melodic change from a structural one: the non-chord-tone work moved the events
  hash on 1486 of 2100 lines and left form and arrangement untouched, which is
  exactly the claim that work was making.

  **If you change the music on purpose, rewrite the baseline in the same commit**
  (`node harness/mk2_snapshot.js write harness/mk2_baseline.snap`) and say so in
  the message. A stale baseline everyone has learned to ignore protects nothing.
- **`mk2_roll.js`** — prints the material as an ASCII grid plus note tables, a
  DERIVATION section, THE POCKET in milliseconds, **accent and slide on the bass**
  (`>` accent, `/n` `\n` slide) with a "303 view" block per material, and
  **PINNED markers** under any lane-bar the user has programmed. Takes
  `--pins <file.json>`. **Read this before and after every composition change.**
- **`mk2_ui.js`** *(new)* — loads the shipped file in Chromium, clicks the step
  buttons, drags the knobs, presses play, reads back what happened. Every other
  harness eval's the `<script>` out of the HTML and never builds a DOM, so
  nothing about the front panels was provable before this existed. ~10 s.

  Its last two checks are not about the UI at all: **every voice renders without
  throwing**, and **none comes out silent**. They live here because this is the
  only suite with a browser, and the hole they close cost real money. `dacHit` —
  the SEGA rig's kick and snare — spent several commits reading `ev.lane` off an
  `ev` it had never been passed, left behind when per-drum chains made the output
  destination depend on the lane. Every DAC hit was a `ReferenceError`, which in
  WebAudio does not degrade: it takes the rest of the render with it, so the DKC
  genre was simply broken. **88 seam checks, 21 UI checks, 10 blend checks and a
  2100-line snapshot were all green the entire time**, because not one of them
  ever CONSTRUCTS A SOUND. The seam checks read tables; the snapshot hashes
  notes; this file reads the DOM. Nothing stood between "the voice exists in `V`"
  and "the voice makes a noise". If you add a voice, this is what covers you.
- **`probe_voices.js`** — the same sweep with the full report: every voice, its
  lane, and its peak. Run it when a voice or a routing change lands.
- **`probe_theory.js`** — the music laws read off the notes, per genre, over N
  seeds: out of key, non-chord tones unresolved, non-chord tones that end a
  phrase, chords under the bass, lead under the chords, unisons. Reports
  **rates, never a pass/fail on one song**. Some of them SHOULD be non-zero and
  the header says which.
- **`probe_controls.js`** — the sweep that proves every control on every machine
  changes the audio. Puts the machine in its slot, strikes every lane it owns
  with four kinds of note, renders with the genre's real space, kick, drive,
  gate and motion plan, and compares peak, level, brightness and tail with each
  control at the bottom and then the top of its travel, over three time windows
  per lane. **Slow** — the TR-1000 is ~40 minutes — so name one machine unless
  you have the wall clock. Whole rack at `4728512`: **0 silent controls on every
  machine except `tr1000.kit`**, a switch between four voice sets that a
  fixed-voice test cannot see by construction.

### The twelve ways probe_controls lied to me

Read this before writing any probe in this repo. Every one of these produced a
confident, wrong, red line, and the pattern is always the same: **the probe was
measuring its own setup rather than the program.**

1. It never PICKed the machine under test, so it read whatever the genre drew.
2. It set `MK2.PICK` but never handed it to `composeSong` — the picks are an
   **argument**, not a global the composer reads.
3. It rendered only the first lane, then called the snare and hat controls dead
   because the note was a kick.
4. It skipped the TR-1000 entirely, because that machine declares `kits` where
   the others declare `lanes` — the only drum machine anybody plays.
5. It struck one short unaccented note, which cannot see an accent knob.
6. It set `PARAMS` where `bus` and `gate` read `TRIM`.
7. It gave keys notes no `wow` field, and the Rhodes scales wow **by** the
   chart's drawn depth, so the knob multiplied zero.
8. It averaged over the whole 55-second, twelve-lane file. Moving the rimshot's
   filter end to end is under 0.1 dB of *global* level. → one window per lane.
9. It averaged over 4.2 seconds when `softAtk` is a **30-millisecond**
   difference. → a 60 ms window at each onset as well.
10. It measured controls that live inside another control's condition
    (`subbass.fall` needs `env`, `tb303.subLevel` needs `subOsc`,
    `tb303.sweepSpeed` needs a run of accents). → one retry with the whole
    machine wide open, reported as `only with the machine open`.
11. It wrote no `slide` on any note, and no note long enough to reach the end of
    a Mellotron tape. → four kinds of note per lane.
12. It gave the CS-80 no `ev.press`, so all three aftertouch knobs multiplied
    nothing — the same mistake as (7), three commits later.

And one worse than all of them: making the short note **accented**, which looks
like a more thorough test, hid `tb303.decay` completely — an accented 303 note
takes `accDecay` and never reads `decay` at all. **A more thorough test can be a
blinder one.** The only reason it was caught is that `decay` had been alive in
the run before.

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

> **START HERE.** The sub-sections below accumulated over many sessions and the
> numbering no longer reflects order. This is the order, as of `4728512`:
>
> 1. **The new tunes and the eleven drum knobs have not passed the user's ears —
>    because they were never in the file being played.** This item used to say
>    the cymbal rebuild was unheard too; that was wrong. The published artifact
>    was commit `0f3a0a9`, which HAS the cymbal rebuild and the fader fix and
>    does NOT have the knobs, the kitFilter or the non-chord-tone law. Corrected
>    and republished at `8a4f8db`; see §3.
>
>    So what is genuinely awaiting ears is: **the tunes under the resolution law,
>    the eleven drum knobs, and the kit filter.** Ask before building on top of
>    them. If the ear says the tunes got blander, the constraint in §5.6 is the
>    first thing to loosen, and the knob for it is the 20% threshold in
>    `mk2_test.js`. **Check `harness/mk2_build.json` before you believe any
>    sentence in this file about what has been heard.**
> 2. **Harmony is the biggest un-started thing** (§5.6, "still open"). Zero
>    chromaticism, 5–12 progressions a genre, voice leading at 4.38 semitones.
>    Measured, named, untouched. This is where the next real musical gain is.
> 3. **Role instances** — the user's "3 arps and two dueling basses" ask. One
>    slot per role today; this needs a register allocator, not a table entry.
> 4. **Genre identity for jungle** (§5.4) — the only genre whose artist research
>    was never completed.
> 5. The small honest list in §5.5.
>
> §5.0 and §5.6 are closed. They are kept in full because *how* they were closed
> is the part worth copying.

### 5.1 ✔ DONE — the 303 has its accent and its slide
### 5.2 ✔ DONE — the step sequencers, editable and pinned

Both landed. See §4. Kept here so the numbering in older notes still resolves.

### 5.0 ✔ DONE — a knob that does nothing is a lie, and now none of them do

This was the standing top priority for several sessions and it is closed. The
whole rack sweeps clean: **0 silent controls on every machine except
`tr1000.kit`**, a switch between four voice sets that a fixed-voice test cannot
see by construction.

What it took, and why it is here rather than in §4: **five separate "this knob
does not reach the sound" bugs turned up in one session and every single one was
found by the USER HEARING IT**, never by anything in the harness. That is a
class of defect, not five accidents. `harness/probe_controls.js` is the answer
to the class. What the sweep found once it was honest:

- **`bus` and `gate` on all five drum machines had never been connected to the
  hand.** `setSpace` passed the genre's argument straight to `rideBus`, so
  `panelValue(machine, "bus")` and `panelValue(machine, "gate")` were never read
  at all. Also the answer to a mystery left open the day before: driving
  `tr1000.gate` from 0 to 0.9 changed nothing, on that build and every build
  before it. Nothing read it.
- **Ten channel-strip knobs on the TR-1000 were wired to nothing** — `sTune`,
  `sDecay`, `tTune`, `tDecay`, `mTune`, `mDecay`, `rTune`, `rDecay`, `cTune`,
  `cDecay`. The kick's, both hats', the crash's and the ride's all worked, which
  is why nobody noticed. `V.s808` called `chTune()` and `chDecay()` on its second
  line, put both into locals, and **never mentioned either again** — grep says
  wired, the sound says no. The other four never asked at all.
- **The ANALOG FILTER was not in the circuit.** `g.kitFilter` was built, given a
  cutoff, ridden by `rideBus` on every song and swept by the Plastikman table
  with a 40-bar LFO — and connected to nothing. Every channel went
  `mk → g.bus.drums` direct, past it. The comment four hundred lines above it
  says "the whole kit through kitFilter on its way to the drum bus". The wire
  disagreed, and the wire is what you hear.

**Keep the sweep green.** Any new control, any new voice: run
`probe_controls.js <machine>` before you claim it works. And read §3's list of
twelve before you believe a red line.

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

### 5.4b The space is an instrument — the echo bus

For a long time this program had **one reverb send and no delay**, and its own
minimal-techno research said at the time: *"MK2 has ONE reverb send and NO
delay, so this single number is carrying the entire signature. It cannot."* It
was right, and in Plastikman and in jungle the space between the notes is not
empty — it is where the music is.

`g.echo` is a tempo-synced delay with **the lowpass inside the feedback loop**,
which is what makes it a dub delay rather than a copy machine: every pass loses
top and the tail dissolves instead of ending. It returns both dry and **into the
reverb**, which is the *"delays on the reverbs"* half of Hawtin's sentence.
The other half — reverb back into the delay — is **not built**; it is a feedback
path between two effects that needs its own stability work, and claiming it
without building it is not something this file does.

Numbers from the technique sources, not taste: dotted eighth at ~20% feedback,
or straight eighth at ~30%; filtered repeats; delays run into long dark reverbs.

All six controls live on a machine with `slot: "space"` and `fixed: true` — no
picker, because there is nothing to choose, but a **panel** and **motion lanes**,
because *"filters and delay feedback are modulated live, with sends ridden on
the mixer to create evolving dub mixes"* is a description of automation. Five of
the six are `kind: "bus"` and ride as curves.

**Measured**, by rendering four bars with the send at zero and at its value and
subtracting — the difference *is* the echo:

| genre | echo adds (rel. dry) | share landing >55 ms from any hit |
|---|---|---|
| **plastikman** | **−12.3 dB** | **79%** |
| dkc | −19.3 dB | 33% |
| vangelis | −20.8 dB | 88% |
| jungle | −25.7 dB | 45% |
| acid | −26.2 dB | 58% |
| lofi | −31.7 dB | 56% |
| synthwave | −32.2 dB | 100% |

**Two measurement traps worth knowing**, because both wasted a pass. First, "%
of the bar above −45 dB" cannot answer this: a wash pad holds 99% of the bar on
its own and a 16th-note hat pattern fills the rest, so the metric reads 99%
either way. Only the difference signal isolates the effect. Second, the first
version of Plastikman's `echoFeeds` named `["keys","lead"]` — but its 303 (both
the bassline and the figure) returns to `bus.bass`, and it has no lead role at
all. The send was on, correct, and connected to nothing with gaps in it: the
measurement read **+0.0 dB**. **Check which bus a voice actually returns to
before naming it in a feed.**

### 5.4c The artist research pass — four more errors of the same shape

Plastikman's bass turned out to be on the wrong lane, so every genre was
re-researched against its named artists. **Four more errors, and three of them
are the same shape: one voice doing the job of two, or a defining mechanism
simply absent.**

**JUNGLE — the Reese.** Jungle's bass has a name, an inventor and a date: Kevin
"Reese" Saunderson, *Just Want Another Chance*, 1988, Casio CZ-5000. Junglists
pitched it down and put it under the Amen. I had a smooth Prophet-style drone.
The growl is **phase, not filter** — detuned sawtooths beat against each other
and cancel where the partials cross ("the wub wub wub sound"), and the beating
speeds up with pitch because it is between *partials*, not at a fixed rate. So
the detune is **tens of cents, not four**. Jungle also carries two low layers,
not one: the growl, plus "pure sine tones, sampled and processed through gear
like the Akai S950" as "a pulsing undercurrent below the frantic breaks."
`V.reese` is both in one patch, because the lane is one.

**LOFI — the Dilla feel was half-built.** The genre had snare-early and
kick-late and nothing else. Ethan Hein, bar by bar on Slum Village's *Get Dis
Money*: the claps on 2 and 4 are **early** ("your ear orients itself around them,
and everything else sounds late"); the offbeat hi-hats are **late**; the bass is
pushed behind — "several of those notes are an entire 32nd note late." The
mechanism is an **early anchor with everything trailing it**, and the parts that
trail are the hats and the bass. `laneLean` already existed (built for Hawtin's
machine drift) and this genre wasn't using it. Measured after: **snare 38 ms
early, hats 16 ms late, bass 51 ms late.** This moved the snapshot; it was
re-baselined deliberately.

**SYNTHWAVE — the bass had no envelope.** Reverb Machine on *Nightcall*: the
verse bass "is a resonant sweep patch ... a decaying filter sweep, achieved by
setting the filter resonance high and using the filter envelope with a long
decay time to sweep the filter downwards." `V.bass` had a **static** lowpass. The
genre drew the 303 half the time and got a sweep; the other half it got a sub
with no movement in it at all. `env` / `res` / `fall` added, `env: 0` is off and
is what every other genre wants.

**DKC — wave sequencing.** Wise: he was inspired by wave sequencing on the Korg
Wavestation and "just [took] eight waveforms and played them in sequence and
that first experiment became the baseline for Aquatic Ambiance." That is a
*mechanism*, not an adjective, and it is why those pads don't sound like a synth
holding a note. `V.waveseq` is four harmonic recipes crossfading in sequence
across the note — deliberately different **spectra**, not filter settings,
because a filter sweep is not a wave sequence. DKC now draws it for half its
songs.

**One thing I checked and did NOT change:** the Dilla kick. Sources conflict —
"kick drum hits about 32nd notes ahead" and "a kick hitting 30 ms early" against
"his snares and kick drums came in a fraction of a second later." Mine sits
essentially on the grid (−1.5 ms measured) because `push` pulls the kit early and
`kickLate` only applies off the downbeat. That is a defensible middle between two
contested readings, and churning it on one source would be guessing.

### 5.6 ✔ DONE — a dissonance has to step, and what is left of it

Of the lead and counter notes **not in the chord under them**, the share that
then leapt away instead of resolving by step: lofi 34.9%, synthwave 33.0%, DKC
38.1%, Vangelis 44.8%, acid 50.0%. One of this project's own documented HARD
laws, unenforced. MK1 had a `HARD.resolvesByStep` and **never called it once.**

It is a **constraint, not a correcting pass** — nothing is moved after the fact;
when the note just written is outside the chord, the *next note's choices* are
narrowed. Three things carry it: the tune narrows its move to one scale step;
the counter narrows its candidate list and **does not play** if nothing in it
answers by step; and the question phrase now lands on a chord tone, because the
answering phrase starts fresh and cannot know what was left hanging.

```
             off      on                     off      on
  lofi     31.5%   14.0%      vangelis     34.2%   16.1%
  synthwave 28.6%  13.3%      acid         50.0%    0.0%
  dkc      32.8%    7.7%      TOTAL        30.8%   12.7%
```

for about 5% fewer lead and counter notes.

**The measurement was also wrong, and in my favour.** Vangelis got *worse* while
everything else improved, so I looked instead of shipping the number: 205 of its
254 "unresolved" lead notes — **81%** — were followed by a REST, some of them
bars long. A note that has died away does not need answering; the probe was
counting phrase endings. There are two columns now because they say different
true things.

**What is still open here, all measured and none fixed:**

- **Zero chromaticism.** Every genre is 0.0% out of key. That is the law working
  and it is also a ceiling: no secondary dominants, no borrowed chords, no
  chromatic passing tones. Nothing in the program can currently write one.
- **5–12 progressions per genre**, and voice leading averaging 4.38 semitones.
  The proposals that were offered and never started: neo-Riemannian PLR moves,
  a voice-leading constraint on the comp, Coltrane's symmetric cycles, and
  tension tied to the arc so the harmony gets harder as the song climbs.
- **`plock` is still rare** — 0 to 3 lanes per genre carry one. The motion
  vocabulary has eight kinds and the tables lean on two.
- **Role instances.** The user asked for "3 arps and two dueling basses" and the
  architecture has one slot per role. This needs a register allocator, not a
  table entry.

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
- ✔ `makeChart` could not pin `rig: "neon"` from the UI — the guard read
  `rigChoice === "band" || rigChoice === "sega"` while `RIG` held **seven**, so
  neon, nemo, box, jungle and plastik were silently unpinnable: the argument was
  discarded and the genre's own draw answered. The picker listed the same two by
  hand, so the two agreed with each other and nothing looked wrong — the same
  shape as the `"auto"` bug in `applyRack`, a hand-copied subset drifting behind
  its table. Fixed at `8a4f8db`: the guard asks `RIG`, the picker is BUILT from
  `RIG`, and `RIG_LABEL` is a separate table because every key of a rig entry is
  a lane and a `label` among them would break the new invariant. Two seam checks,
  the second of which would have caught it: *every rig names every lane any rig
  names, with a voice that exists* (7 × 18, all dispatchable) and *pinning a rig
  actually pins it* (147 pins honoured). Snapshot IDENTICAL — this changes who
  plays, never what is played [Law 6].
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
  `setSpace`, which happens once per render. They are ridden by `rideBus` across
  the song, so they DO move with the plan — what they cannot do is change
  per-note the way a panelled machine's controls do. Know that before adding a
  `plock` to `kit.*`.
- **Non-chord-tone resolution is 12.7%, not 0%, and that is deliberate.** §5.6.
- **Crash harshness has not been heard.** Measured at 44% less energy in the
  2–6 kHz band, shorter tail, 2.4 dB off the peak. Whether it now sounds like a
  cymbal you want is not something a probe can say.
- **`probe_controls.js` on the whole rack is roughly an hour.** The TR-1000
  alone is ~40 minutes under the current four-notes-per-lane test. Run it in the
  background and name one machine when you can.

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
- **A measurement taken outside the instrument's working range measures the
  range, not the instrument.** Twice in one day, in two different shapes. First:
  the 303's ACCENT SWEEP knob read DEAD, and it was not — at the panel's default
  cutoff of 520 the envelope already opens the filter to 10.4 kHz, and 10.4 kHz
  against 11 kHz on an 82 Hz saw is the same filter to an ear. The knob had no
  room because the filter was open past audibility before it was touched; at
  cutoff 250 the same knob moves the top from 4,019 to 7,144 Hz. Second: a
  before/after render of the first 20 seconds reported that ACID — the genre
  named after the instrument — had not moved at all, because since the build
  work the 303 does not enter until 31 s. I measured the intro and called it the
  genre. **Anchor the window to the thing you are measuring**, then read it.
- **The echo tail was not accumulating.** The stutter the user heard was real
  and the theory was wrong: measured, the tail *decays*. So did "the main thread
  is stuttering" — p50 frame time 17 ms. The actual causes were a note landing
  before `t0` and never hearing the fader, and the gated-verb send sitting in
  FRONT of the channel fader. **Two wrong theories died to one measurement
  each**; do not start editing until you have the number.
- **Routing a voice INTO the chain's gate node does not move it post-fader.**
  First attempt at the gate fix did exactly that and put the raw output back in
  front of the fader. `gateTap()` returns **null** for a voice that has a
  channel, because the channel already feeds the gate from `mk`.
- **A "softener" that makes things louder is not a softener.** The 303's muffler
  measured **+2.0 dB**. Rebuilt on `chainCurve`, which has unity slope at the
  origin.
- **A more thorough test can be a blinder one.** Making `probe_controls`' short
  note accented — strictly more coverage — hid `tb303.decay` completely, because
  an accented 303 note takes `accDecay` and never reads `decay`.
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
- **The container has rolled this clone back three times in one session**, twice
  mid-task, to a commit several days old. Nothing was lost because everything
  was pushed. If `git log` shows a HEAD you do not recognise, that is what
  happened: `git fetch origin claude/code-review-6jd9cz && git reset --hard
  origin/claude/code-review-6jd9cz`, then check what you had uncommitted.
  **Commit and push early. Do not sit on work.** And do not trust a file you
  read before a long-running background job — read it again.

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
| `harness/mk2_test.js` | the 93 seam checks |
| `harness/mk2_snapshot.js` | proof that a refactor is a refactor |
| `harness/mk2_ui.js` | the panels, driven in a real browser |
| `harness/probe_controls.js` | every knob on every machine reaches the sound |
| `harness/probe_theory.js` | the music laws, read off the notes |
| `harness/probe_voices.js` | every voice fires and none is silent |
| `docs/genre-research/NOTES-FROM-THE-USER.md` | **the running log of what was measured, what was wrong, and why.** Read it with this file. |
