# Planning the FX off the track, not off a table

> "why not build something that plans the fx for the track itself instead of a
> blind baked in automation? Shouldn't the automation be custom to the track
> based on whats going on in the track?" — owner, 2026-08-20

He is right, and the criticism landed hardest on the block written the same
day. `kind: "section"` says *"in the bridge, open the echo"* — a statement about
the **form**, made before a single note existed. Two records of one genre with
wildly different arrangements got identical automation, because the table could
not see either of them.

---

## 1. What it reads

`makeMotion(chart, form, sections, materials)` already receives everything: the
section objects stage 4 built (energy, occurrence, peak, which roles are
active, the drum level) and the materials each section will actually play. Six
curves are measured off that, one value per bar, **nothing naming a genre**
[Law 4]:

| reading | what it measures | why a mix cares |
|---|---|---|
| `space` | 1 − (voices sounding, weighted by how busy each is) | reverb on a full arrangement is mud; on a sparse one it's the room |
| `gaps` | 1 − onsets per bar, normalised across the record | a delay needs somewhere to put its repeats |
| `energy` | the record's own arc, which stage 4 already drew | saturation is loudness |
| `air` | the pitch ceiling, normalised | a shelf opened above the top note adds hiss and nothing else |
| `weight` | pitch floor + drum level | where the record is low and hard |
| `change` | material changed + voices in/out + a new statement | a colour that arrives *with* something belongs to it |

**Busy-weighted, not a headcount.** A drone holding one note and an ostinato
running sixteenths are both "one voice" to a count and are nothing alike to an
ear, so each voice contributes its own onset rate, capped at four a bar — past
that an ear stops counting notes and starts hearing texture.

**Normalised across this record.** The question a mix asks is never "is 7 notes
a bar a lot" but "is this section busier than the rest of *this* record."

**Smoothed across the seam.** A section boundary is a step and a step on a send
is a click; a two-bar box glide run twice is a triangle, which is a fader ride.

## 2. What the genre still owns

Only the **appetite** — which controls the planner may move, which reading
drives each, and how far it may travel. `by` is `[at reading 0, at reading 1]`,
so each line reads as a sentence:

```
"matrix.keysRoom": { read: "space",  by: [-0.45, 0.00] }   the fuller it gets, the drier
"echo.send":       { read: "gaps",   by: [-0.05, 0.16] }   the delay plays in the holes
"dp4.bLvl":        { read: "energy", by: [0.00, 0.22] }    drive where the record is loud
"desk.high":       { read: "air",    by: [-2.5,  2.0] }    no shelf above the top note
"flange.rate":     { read: "change", by: [0.00, 0.35] }    a colour arrives WITH something
```

It expands into ordinary `kind: "curve"` lanes — the mechanism `fm`, `sh`,
`dejavu` and `bernoulli` already compile to — so `motionAt` stays arithmetic,
stage 6 never learns a planner exists, and Law 10 holds. **Appended, never
prepended:** a spec's draws come from `motion:<key>:<i>`, so adding one at the
end of a key's list cannot move a hand-written spec's stream position.

## 3. It does not replace the author

A `section` lane saying *"the room CLOSES for the fight"* is a **narrative**
decision and no measurement will ever produce it. A planner saying *"this
section is dense, pull the room"* is a **mixing** decision and no table can make
it per record. Both compile to lanes on the same controls and they **sum** —
which is what an engineer riding a desk over a written arrangement is doing.

## 4. Measured — it reads the track

Fantasy synth, `matrix.keysRoom`, same section function, same genre:

```
seed 1  verse   4 voices   6.5 onsets/bar  ->  keysRoom 0.560
seed 1  verse   6 voices  12.0 onsets/bar  ->  keysRoom 0.297
seed 3  chorus  4 voices   8.8 onsets/bar  ->  keysRoom 0.238
seed 3  chorus  7 voices  19.5 onsets/bar  ->  keysRoom 0.000
```

**The thin chorus keeps its room and the full one loses it.** A table could not
do that; it does not know how many voices are playing.

And `desk.high` at the fight: **+4 dB** on seeds 1 and 3, **−1 dB** on seed 2 —
because seed 2's arrangement does not reach as high, and there is nothing up
there to open a shelf over.

### The null test

The same record rendered with the `fxPlan` block removed and *nothing else*
changed — same seed, same notes, the hand-written story lanes still running
underneath. dB below the excerpt's own signal:

| movement | the planner alone is worth |
|---|---|
| before dawn | −18.2 |
| setting out | −15.3 |
| into the deep | −16.8 |
| the fight (chorus) | −12.1 |
| the fight (instrumental) | −12.8 |
| the long way home | −11.3 |

## 5. The cut

> "What about the rack that cuts the fx?" — owner, same message

The program **has** one: `picks.mute.fx` empties the space outright (`wet: 0`,
`echoFeeds: []`, `echoKill: true`). But that is a **hand on the panel**, not
something a record ever does to itself. The famous version of the move is
Hawtin's:

> "I'd let all the effects play, and then in one set INSTANTLY turn off the
> effects, and then EIGHT BARS LATER turn them back on."
> [corpus:soundonsound, Classic Tracks]

The program grew a `snap` kind for exactly this and **no genre has ever
declared one** — because no table can know where a record earns it.

A planner can. The cut goes where the arrangement makes its biggest jump into
its own peak: the section with the largest `change × (energy − mean energy)`.
The effects come off the bars leading **into** it, and the silence is what makes
the arrival land — the same reason the empty exists on the note side. **One a
record, at most.**

Measured, eight seeds:

```
seed 1   4 bars off at 10:07 (52% in), back on the downbeat of chorus #1 — 7 voices
seed 4   4 bars off at 11:52 (63% in), back on the downbeat of chorus #4 — 8 voices
seed 8   4 bars off at 10:01 (51% in), back on the downbeat of chorus #1 — 8 voices
```

**And the planner says what it did.** `plan.fxCut` carries the bar and the
length. The first version of this probe worked the cut out by looking for a dip
in the curve — a probe keeping its own copy of the rule, which is the mistake
this file has caught five times now, and it caught it again in one run: the
threshold found dense sections and called them cuts.

The drone's own crossings carry `cut: false`. The floor does not go away.

---

## 6. And two things in the pack were not being used

> "There is a bunch of sfx files in the errang files we should be using, and we
> should be utilzing the pads in the pack for drones" — owner, same message

**Measured before changing anything**, because "we should be using X" deserves a
count:

- The drone lane emitted **193 events across 96 records and every one was
  `dronebox`**, the synth. The ten `Pad` samples were reachable only as patches
  of the *strings* shelf — a keys machine — so the one lane in this program that
  holds a note for a whole record could not play the ten samples in the pack
  recorded to be held.
- The eight loopable beds and two one-shots **were** reached, but a record drew
  **one bed** and spent it under the whole thing. No record touched more than
  two of the ten sounds. `Noise_loopable_04` was never heard at all.

### `INSTRUMENTS.erangPad`

One entry and one line of factory — `drone` was already a rack slot and
`erangVoice` already loops a sample at its measured loop points.

**Why both drones stay.** The dronebox is six detuned oscillators through a
filter, so what it evolves *by* is beating and cutoff — the eurorack answer this
repo researched at length. A recorded pad is a fixed spectrum with a real room
already in it, so what it evolves by is **the rack**: the filter, the flanger
and the tape are the only things that can change it. Two different instruments
for the same job; a genre draws between them (fantasy synth 6:4 toward the
synth, because its drone is *stacked* 0-7-12 and six oscillators take a stack
better than one recording layered three times).

The pad's envelope is the one place `bloom` finally earns itself: attack 2.6 s,
release 5.2 s, **bloom 0.72 over 7.5 s** — the Korg-M1 filter-opening-across-the-
note gesture, on the only part long enough to hear it happen.

Now: **138 dronebox events / 55 erangPad**.

### The air changes with the movement

The chart draws a **pool** of beds (three extra picks appended *after* the
existing five draws, so every number already dealt keeps its place and a genre
declaring no `layers` is byte-identical). The arrangement deals them across the
section functions in order of first appearance.

**And a bed has to last long enough to be a place.** The first version dealt the
pool straight across the functions and measured, seed 1: during the fight, where
`chorus` and `instrumental` alternate every sixteen bars, **the air swapped
every thirty seconds** — 01, 05, 01, 05, 01, 05. That is not an atmosphere, it
is a fader being flapped, and it is the same blinking defect the `chorus`-only
fx lanes were caught by two builds ago in different clothes.

The fix is a statement about *places* rather than about form, so stage 5 may
hold it [Law 4]: **a place you are in lasts.** A bed holds for a minimum dwell —
the record's own bars divided by twice the number of layers, floored at sixteen
— and a function whose turn comes round again inside that window does not get to
change it.

```
fantasysynth seed 1
   0:00   5.5 min  Noise_loopable_01
   5:29   4.8 min  Noise_loopable_04
  10:15   2.5 min  Noise_loopable_01
  12:44   6.2 min  Noise_loopable_05
  14:15   0.1 min  sfx_catacomb        (the accent, on the peak)
```

Across 96 records the pack now reads: every bed between 13 and 57 records,
`Noise_loopable_04` from **0 to 22**.

### And the world steps back when the band fills up

`atmos.far` — how far away the place is — had been a fixed number in every
record this program has made. It is in the fx plan now, reading `space`: the air
behind a five-piece at full tilt is not the air behind two instruments on a
road, and the difference is **distance** rather than level.

**These are offsets on a base, not absolute positions**, and the first version
of those two lines forgot it: `by: [0.30, 0.75]` on an `air` whose base is 0.5
asks for 0.80..1.25, so the knob sat pinned at its ceiling for most of every
record — and the measurement said so (air 1.00 on four beds out of five).

**And it is sampled per bed, not continuously**, because `far` and `air` are
`gesture` controls — read once when the event starts, like every other per-note
knob — and a bed is one long event. Since the beds are now dealt per movement,
that means one distance per movement: four distances a record against the one
number it had before. Making it glide *inside* a bed means riding the atmos
voice's own nodes, which is a graph change and is in the backlog.

```
seed 1   far 0.29 -> 0.42 -> 0.51 -> 0.54 -> 0.59   air 0.30 -> 0.75
```

---

## 7. State

- 4 genres × 32 seeds: **0 throw**
- lofi, synthwave, dungeon synth: **0 of 24 records changed**, byte for byte
- blends, 144 pairs: **0 throw**
- offline render vs live: **−92.2 dB** below signal

**And one render died mid-run** — "Target page, context or browser has been
closed" after 12 of 51 excerpts. The re-run completed all 51 with no change to
the code. Environmental, not a defect: *run it twice before you believe it once.*
