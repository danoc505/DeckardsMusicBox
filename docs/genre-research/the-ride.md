# THE RIDE — the visualiser, `2026-08-17`

`docs/HANDOFF-BOXCAR.md` §7, built:

> *"a live pixel-art side-scroller above the piano roll: the train in profile,
> the band aboard with the players who are sounding animated, parallax
> landscape, day/night from the record's own clock, weather from its own draw.
> A station sprite must arrive within a beat of the brake sample."*

---

## 1. THE ONE RULE IT IS BUILT ON

**Nothing on the glass is a second model of the journey.** Every fact is read
off the same song object the audio was made from:

| on screen | read from |
|---|---|
| the terrain | `form.trip.segments` — `{kind, at, sec}`, in seconds |
| the hour, the sun and the stars | `form.trip.hourAt(t)`, `.dawn`, `.dusk` |
| rain, snow, lightning | `form.trip.fronts` — `{kind, at, sec, thunder}` |
| **is the train moving** | **`form.ridePos[bar]`** — `-1` while standing |
| a city platform or a country halt | `form[i].place` |
| who is playing, right now | `perf.events`, by role, at the playhead |
| the playhead itself | `songTime()` = `Sound.now() - PLAY_T0` |

`ridePos` is the point. It is **the same array the passing-bed gate asks** when
it decides whether a bird sweeps past or sits still — so the landscape stops
scrolling and the bird stops passing on one decision, not two.

This project has shipped a picture that disagreed with the sound twice: the tape
drawing a running deck over dry audio, and the medium read off a channel
`setSpace` never receives. Both times the picture was the thing being believed.
A visualiser is the easiest place in the program to do it a third time, so the
ride does not get its own numbers.

---

## 2. WHAT THE MEASUREMENTS FOUND — four faults, none of them visible in code

### 2a. The station was drawn behind the locomotive

The anchor was *"the station's right edge, one car-gap past the cowcatcher"* —
which is where the **platform's** right edge goes, and the building sits at the
platform's right end. At rest it landed at x 148–182 with the loco spanning
140–192. It was drawn, the code was correct, and it was entirely invisible.

Anchored on the **building's left edge** instead, which is also the true
arrangement: you stop with the cars at the platform and the engine past its end.

### 2b. And then it was 34 pixels short, because a train coasts

Anchored at `at(t0)` — the second `ridePos` goes to `-1` — the platform still
landed 34 px behind the train. **`ridePos` flips at the bar the stop starts and
the smoothed speed is still 0.3 there**: the train runs into the platform for a
few more seconds, which is the entire reason there is a brake sample. The anchor
is now the distance at the **middle** of the halt, where the speed is zero and
staying zero.

### 2c. The landscape crept under a stationary train

Found by `probe_ride.js`, not by looking: **20 of 602 samples taken in the middle
of a stop moved more than a pixel over four seconds.** An exponential never
reaches zero, so the speed smoothing left a tail. Invisible to the eye and
exactly the class of picture/record disagreement the probe exists for. A
deadband takes the tail off and rescales the rest, so the ramp keeps its shape
and nought means nought. **20 → 0.**

### 2d. A global edited through a local name

Rain pulls the palette toward slate. `ridePalette()` returns one of the
`RIDE_SKY` **constants unchanged** whenever the hour is squarely inside a band —
so doing it in place would have dimmed `RIDE_SKY.day` itself, and every record
after the first shower would have been overcast for ever. Caught by reading it
back before it shipped; the copy is now explicit and the reason is in the
comment.

### 2e. Two things that were drawn and did not read

- **The far hills were a bar chart.** One random height per 8-pixel column came
  out as a city skyline in the middle of a farm, because hills do not have
  vertical sides. Summed sines at irrational ratios give a ridge that rises,
  falls and never repeats.
- **The river was green.** Painted in the land colour it was a green band among
  green bands. Water reads as water because it *reflects*, so the band is the
  sky's own colour — blue at noon, orange at dusk, near-black at night, with no
  second palette to keep in step.

---

## 3. THE PARALLAX, AND WHY THE NEAREST LAYER MATTERS MOST

| layer | speed | what it is |
|---|---|---|
| stars | 0 | genuinely at infinity — they do not scroll |
| far ridge | 0.14 | the horizon |
| near ridge | 0.29 | so distance reads as distance |
| the country | 0.55 | farm · woods · open · river · town, one look each |
| the verge | 0.8 | scrub beside the line |
| **sleepers and ballast** | **1.0** | the only layer the train is touching |
| the near grass | 1.6 | in front of the camera |

The sleepers are 1.0 because the wheel has to sit on the layer that moves with
it or the train reads as sliding. And the bottom eighteen rows were a flat slab
until the 1.6 layer went in — **the speed of a side-scroller is carried by
whatever is nearest**, and the nearest thing here was nothing at all.

---

## 4. THE GUARD — `harness/probe_ride.js`

Eight claims, all falsifiable, asked of `MK2.rideState()` — the plan the canvas
is actually drawing from, not a copy of it:

```
✓ every record builds a ride plan                        8 built
✓ the landscape stops when the train does                0 of 602 standing samples moved
✓ and it moves when the train does                       0 of 1011 running samples frozen
✓ the platform is beside the train at every stop        18/18
✓ and it is NOT beside the train two minutes earlier    18/18 still off to the right
✓ the station is in frame and ahead of the train
  when the brake sounds                                 18/18
✓ a player in the doorway moves while its part sounds   38/38 seats
✓ and is still while its part rests                     38/38 seats
```

**§7's sentence, measured.** The station is in frame and ahead of the train at
the brake on every stop of every seed, and the train then **comes to rest
10.6–13.3 beats later** — which is the brake *running in*, exactly as the stop
script declares it: *step 2, "arrive: brakes, running into the downbeat"*. The
handoff asked for "within a beat"; what the record actually does is put the
brake ten to thirteen beats ahead of the stand, and the picture follows the
record rather than the sentence. Both numbers are printed so the difference is
visible rather than smoothed over.

**It has been watched failing.** Point the ride at a clock of its own —
`raw[i] = 1`, the train never stops — and it reports `310 of 310 standing
samples moved` and `0/9 in frame`, and exits 1.

### 4a. Why the "still while resting" claim is weaker than it looks

It asks each seat at the midpoint of its longest silence. That proves the cursor
answers zero where the part is not sounding; it does not prove the *drawing*
consults the cursor. The drawing does — `lvl > 0` gates both the bob and the arm
— but the check is on the state, not on the pixels, and it is written down here
rather than claimed as more than it is.

---

## 5. WHAT IS NOT BUILT

- **The station arrives; nobody gets on or off.** A city platform has people on
  it and they bob; they do not board. The doors sample (`railDoors`) fires and
  nothing on screen answers it.
- **No bridge, no tunnel, no crossing.** `crossing` is on `form[i]` and the ride
  ignores it.
- **The band is six or seven anonymous figures.** They are coloured by seat
  order, not by instrument, so you can see *that* the answer is playing without
  seeing that it is a diddley bow. `INSTRUMENTS[voice]` has the name; nothing
  draws it yet.
- **The smoke is stateful**, so scrubbing backwards leaves a puff drifting the
  wrong way for a second. Everything else on the glass is a pure function of
  `t`, and the smoke should be too.
- **`drawRack()` is still a stub** — unrelated to the ride, found while looking
  for where to put it, and logged separately.
