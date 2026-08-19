# THE DRONE THROUGH THE RACK — all the knobs, different levels, different speeds

*Built 2026-08-19, build `2026-08-19k`.*

> "The drone's matrix should have **ALL the knobs automated at different levels,
> different speeds**! **You stack a bunch of FX on a drone and it then evolves!**
> This is also true for the instruments. Dungeon synth is about **degradation**
> of the sound — the FX helps achieve that. This is also why we added rests, so
> it can **build up and then do a quick rest, all in sync with the song**."

Four claims. All four were true about the program, and all four are measurable.

---

## 1. THE DRONE'S ROW WAS ONE CROSSING WIDE

```
                Mix    Echo   Room   Spring  Flange  DP/4   Pole
  dungeonsynth  1.00   0.00*  1.00   0.00    0.00    0.00   0.00
  boxcarsynth   1.00   0.00   1.00   0.00    0.00    0.00   0.00
                              * opened only by a motion lane, base 0
```

Four units the ground of the record never touched. **"You stack a bunch of FX on
a drone" and the program stacked one.**

And the reason it could not have been otherwise until this week: **a crossing was
1 or 0.** "A bunch of FX at different levels" was not a sentence this file could
write — every unit would have been at full or absent, which is a wash, not a
stack. It is a stack *because* the numbers differ.

```
  after         Mix    Echo   Room   Spring  Flange  DP/4   Pole
  dungeonsynth  1.00   0.30   1.00   0.20    0.26    0.34   0.00
  boxcarsynth   1.00   0.22   1.00   0.18    0.00    0.00   0.00
```

---

## 2. THE DEGRADATION IS SOURCED, NOT CHOSEN

> "Keep timbres slightly dated or lo-fi (e.g. 90s workstation presets, **bit
> reduction**, light saturation) to evoke tape-era character."

> "Embrace tasteful noise floor, tape wow/flutter, or **mild distortion** to
> achieve a worn, archival feel."
> [corpus:melodigging, *Dungeon Synth*]

**Bit reduction is the DP/4's crusher and mild distortion is its drive** — two
algorithms this rack has had since it landed that no genre had ever sent a signal
to. Dungeon synth runs both: block A on crusher, block B on drive.

And the ground of the record is the right thing to run them on. **A degraded
drone is a worn tape; a degraded lead is a broken instrument.**

**The barberpole is the one refusal.** An endless rise under a drone is a strong,
specific illusion and nothing in this genre's sources asks for one — that is
synthwave's word. Left shut.

Boxcar takes the echo and the spring and **not** the DP/4: nothing about a train
is bit-reduced. Its flanger stays on the `rail` row where the physics put it — a
ground reflection sweeps because the source *moves past*, and a drone that is
always there has no pass.

---

## 3. DIFFERENT SPEEDS — AND THE POOLS WERE POWERS OF TWO

The row and column modulators built the day before drew from `8/16/32/64` — **the
same tidy powers on both axes**. Measured on the drone: every one of its five
crossings carried the identical 16, 32 and 64-bar lanes. The whole row and the
whole column moved in exact lockstep, and the stack was one movement wearing five
names.

That is a lesson this repo had already collected and not applied to the machinery
it built next: boxcar's train runs 23/31, 13/17, 19/29 bars at once, *coprime by
choice*, because two lanes return to the same relative phase after `LCM(a,b)`
bars and with distinct primes that is `a·b`. **16 and 32 return after 32. 17 and
31 return after 527.**

So: the row pool and the column pool are now **prime and disjoint**, per genre —
which fixes every row, not the drone's. That is the owner's *"this is also true
for the instruments"*, answered once rather than instrument by instrument.

And each drone crossing gets a third lane of its own, on a prime nothing else on
that drone uses:

```
  dungeonsynth  droneEcho    19 41 79     repeats after 61,541 bars
                droneFlange  43 73        repeats after  3,139
                droneDP4     19 47        repeats after    893
                droneRoom    19 67        repeats after  1,273
                droneSpring  61

  boxcarsynth   droneEcho    23 29        repeats after    667
                droneSpring  59
```

**Automated crossings with two lanes at the same speed: 0**, in all four genres.
A 164-bar record is a fraction of the shortest of those cycles, which is the
definition the research collected — *"several slow LFOs at rates that do not line
up"*, *"you can't have enough LFOs and random generators"* for drones.

---

## 4. THE BUILD AND THE REST ARE ONE GESTURE

> "This is also why we added rests, so it can build up and then do a quick rest,
> all in sync with the song and the timing in the song itself."

`gesture` with `on: "empty"` has existed in this file for builds. **No genre had
ever declared it** — measured, zero across four genres. It is the one motion
window that fires exactly where an empty fires.

So the crusher climbs across the four bars *into* the empty, and the empty is
what it arrives at. The build and the hole are in sync because they are keyed to
the same flag — not to a second clock that has to be kept in step by hand.

```js
droneDP4: [ …,
  { kind: "gesture", on: "empty", bars: 4,
    from: [0.00, 0.02], to: [0.16, 0.30], curve: "exp" } ]
```

The empty itself was ungated one build earlier, so this fires three to four times
a record instead of once.

---

## 5. TWO SILENT OVERWRITES, BOTH CAUGHT BY READING THE PLAN BACK

Neither threw. Neither warned.

**A second `matrix: {}` in one genre's motion.** A duplicate key in an object
literal: the later one wins and the earlier is discarded without a word.
`droneSpring`, `droneFlange` and `droneDP4` came back carrying only the axes'
own lanes and none of the primes declared for them.

**Then a second `droneEcho:` inside the merged block** — the same mistake one
level down, and its lane vanished the same way.

Both were found by reading the lanes back off the finished plan rather than
trusting the table. That is the *"fixed it by causing a silence"* shape this file
has been bitten by three times, in a fourth costume — and the reason the check
now printed in §3 exists at all.

---

## 6. WHAT IT MEASURED

```
  crossings on the drone      1  →  5   (dungeonsynth)
                              1  →  3   (boxcarsynth)
  lanes on the drone          7  →  10  (dungeonsynth)
                              1  →  5   (boxcarsynth)
  knobs with two lanes at one speed:  0, all four genres
  notes moved, 24 records:            0  — this is all stage 6
  lofi and synthwave:                 untouched to the decimal
  blends:                             6 of 432, collisions still 0
```

### And it is audible

Dungeon synth seed 1, rendered on this build and on the previous commit, nulled:

```
  below signal   -50.4   -13.2   -18.6   -20.2   -17.3   dB
  repeatability floor                              -91   dB
```

Seventy-plus dB above the renderer's noise on every section that carries the
drone — and the intro, where the ground has barely entered, is the one at −50.

**And it is colour, not level.** RMS within 0.2 dB of the previous build, peaks
within 0.2 dB, nothing clipping. A crusher and a drive at the levels the sources
call "mild" and "tasteful" change what the record sounds like without changing
how loud it is, which is the correct outcome and was worth checking: an
overdriven block is the easiest way to make a build sound "better" by simply
making it louder.

---

## 7. WHAT IS NOT BUILT

- **`tape.wow` and `tape.flutter`** are named in the same sourced sentence as bit
  reduction, and they are `voicing` — read once per song, ridden by nothing. The
  degradation this build reaches is the DP/4's; the tape's is still a setting.
- **The barberpole** on any drone, deliberately (§2).
- **Nobody has heard it.**

---

## Sources

- [Dungeon Synth — Melodigging](https://www.melodigging.com/genre/dungeon-synth) *(bit reduction, mild distortion, noise floor, "worn, archival feel")*
- `docs/genre-research/the-evolving-drone.md` — "several slow LFOs at rates that do not line up"; the coprime argument the axes needed
- `docs/genre-research/the-matrix-axes.md` — the row and column modulators whose pools this build made prime
- `docs/genre-research/a-crossing-is-a-knob.md` — why "different levels" became sayable at all
- `docs/genre-research/the-empty.md` — the rest this build's gestures climb into
