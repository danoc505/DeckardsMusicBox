# THE EVOLVING DRONE — the parts are all here, and one genre's drone stutters

*2026-08-19, at the owner's direction: "research how to make evolving drones,
and making evolving drones in eurorack… We should have the needed things to do
this and yet we don't have an evolving drone. Diagnose the issue with your
research and tell me your plan."*

**BUILT 2026-08-19 — see §6 for what it measured, and §7 for the correction the
owner's ear made to §3b.**

**The owner is right that the parts are here — and half right that we don't have
one.** Boxcar synth's train *is* an evolving drone by every definition below.
Dungeon synth's is not, and the reason turns out to be arithmetic rather than
taste. Nothing is built yet; this is the diagnosis and the plan.

---

## 1. WHAT THE SOURCES SAY AN EVOLVING DRONE IS

Consistent across the studio sources and the eurorack ones, and it is four
things, not one:

**Layers, detuned, beating against each other.**

> "Drones are sustained, evolving tones created by **layering** long audio grains
> with heavy reverb and slow modulation." [corpus:nodegrain]

> Take a saw, put oscillator 2 an octave below and oscillator 3 two octaves
> below, then "offset the Fine detune slightly (about +25) and **modulate this
> very slightly** using a tempo-synced LFO." Applying an envelope to unison
> detune "detunes each voice… to introduce **'beating'** at lower values… copies
> of the same waveform fall in and out of phase with each other."
> [corpus:modeaudio]

**Slow modulation, shallow, on more than one thing at once.**

> "Use slow amplitude, pitch, phase, and pan modulation with **LFO rates synced
> to something slow, with a smooth contour and shallow depths**."
> [corpus:modeaudio]

> "There's a **really slow modulation of the cutoff**… **attenuated so as not to
> overpower things**. The decay of the reverb is also modulated… for spacey
> swells." [corpus:musicradar, ambient drone on a modular]

> "For ambient and drones, **you can't have enough LFOs and Random generators**."
> [corpus:modwiggler]

**Modulators that are themselves modulated, so nothing lines up.**

> "Try assigning an envelope to an LFO, looping if possible, so you can have
> **modulations that drift in and out**." [corpus:modeaudio]

**And something non-periodic — the eurorack answer is sample-and-hold.**

> "A sample and hold can give you **'generative' powers right away** by sampling
> from a repeating function… **by running the LFO and clock at different rates**,
> you'll be able to find a whole world of shifting patterns."
> [corpus:perfectcircuit]

> "Any random voltage generator passed through a **quantiser**" makes a
> generative patch; feeding it in "creates what can be called an 'auto-melody
> generator' that can be tapered from subtle repeating notes to several crossing
> octaves, **depending on how much random voltage is allowed**."
> [corpus:reverb]

**One tuning note the sources agree on:** the drone itself is usually **one
pitch**. "We've tuned it to a single note, no volts per octave, as this is a
simple drone" [corpus:musicradar]. The evolution is in the *timbre and the
layers*, not in the notes. That matters for the diagnosis below.

---

## 2. THE PROGRAM ALREADY HAS EVERY ONE OF THOSE

Not approximately — exactly, and better sourced than most of what is here:

| the source asks for | the program has |
|---|---|
| several slow LFOs at rates that do not line up | `kind: "lfo"` with periods **in bars**, drawn from pairs, and `freePhase` — boxcar's train runs **23/31, 13/17, 19/29, 11/17, 47/61** bars at once. Coprime by choice. |
| shallow depths, attenuated | every lane's depth is a `[lo, hi]` range drawn per record |
| slow filter movement across the piece | `kind: "arc"`, with `curve: "sCurve"`, from one value to another across the whole record |
| sample-and-hold | `kind: "sh"`, with `every: [[11,2],[17,1]]` and a **slew** — a real S&H with lag |
| a random voltage source with a "how much" control | **a JavaScript port of Mutable Instruments' `marbles/random/random_sequence.h`**, from the actual source, MIT notice preserved — the déjà-vu parabola and both mutation regions |
| a quantiser | `scaleStep`, `intoBand`, `degMidi` — the whole harmony layer |
| layers | the rack: multiple instruments, per-role |

**Boxcar's `trainbox` uses all of it.** Its motion table moves `level`, `window`
(the filter), `rumble`, `air` (on a sample-and-hold), `drift` and `pan`, each
with two or three modulators of different kinds at coprime periods. By §1's
definition that is an evolving drone, and it is already shipping.

---

## 3. SO WHAT IS ACTUALLY WRONG — two things, both measured

### 3a. Dungeon synth's drone has NO motion lane at all

Its drone plays `dronebox`. Its motion table has lanes for `horns`, `bassoon`,
`contrabassoon`, `bariSax`, `bassOboe`, `corAnglais`, `carnyx`, `tr1000`,
`erangStrings`, `mellotron`, `vp330`, `echo`, `desk` and `matrix`.

**There is no `dronebox` entry.** The one voice that sounds under the entire
record is the one voice nothing modulates. Its filter, its level and its timbre
are the same in the last bar as in the first.

### 3b. And its drone RE-ATTACKS ABOUT FORTY TIMES A RECORD

Measured, 30 records a genre:

```
  genre          drone notes    distinct pitches    one pitch all record
  dungeonsynth      40.3              1.8                10/30
  boxcarsynth        4.3              1.2                23/30
```

Forty attacks is not a drone, it is a repeated note. And the cause is
arithmetic:

```js
dungeonsynth   drone: { unit: 8, hold: 2, … }     materialBars: 4
```

`buildDroneLane` walks `for(let b = 0; b < BARS; b += unit)` where `BARS` is the
**material** length. With `unit: 8` and a **4-bar** material the loop runs
exactly once — so the material holds **one** drone note, of length
`8 × 16 × 2` = sixteen bars — and then the arrangement replays that four-bar
material about forty times across a 163-bar record. **Every replay re-attacks
it.** 163 ÷ 4 ≈ 41, against 40.3 measured.

The builder's own comment says it "does not re-strike when nothing has changed",
and that is true *inside* a material. Nothing was watching what happens when the
material repeats.

**Boxcar does not have this problem because it declares `continuous: true`** —
one held event for the whole run, built outside the material loop. Dungeon synth
declares no such thing, so its `unit: 8` is a number that can never be reached.

### 3c. And the third thing, which is the sources' own point

Dungeon synth's drone is **one voice**. §1 is unanimous that an evolving drone is
**layers** — detuned copies beating against each other. One oscillator with no
modulation is not a thin drone, it is a held note.

---

## 4. THE PLAN

**Nothing new needs inventing. Three steps, in this order, cheapest first.**

### Step 1 — stop the stutter *(a table change and a guard)*

Give dungeon synth `continuous: true` so its drone is one held event per run
rather than one per material repeat, and **make `buildDroneLane` refuse a `unit`
larger than the material it is writing into** — either by clamping it or by
throwing, because a unit that can never be reached is a table saying something
the builder cannot do. Measure: drone attacks per record should fall from ~40 to
single figures, and note length should rise.

*This is the one that changes what you hear most, for the least code.*

### Step 2 — give the drone motion lanes *(a table change, machinery exists)*

A `dronebox` entry in dungeon synth's motion table, built the way `trainbox`
already is and sourced the same way:

- **the filter** — an `arc` across the record plus two `lfo` lanes at coprime bar
  periods with `freePhase`. "A really slow modulation of the cutoff, attenuated
  so as not to overpower things" [corpus:musicradar].
- **level** — `section` moves plus one slow `lfo`, so the drone breathes under
  the arrangement rather than sitting at one gain.
- **one `sh` lane** with slew, for the non-periodic element the eurorack sources
  make central [corpus:perfectcircuit].

Every depth shallow, per §1. **Nothing here is new machinery** — it is the
`trainbox` table with dungeon synth's own sources behind the numbers.

### Step 3 — the layers *(the only part that is a real build)*

The sources are unanimous that a drone is **detuned layers beating**, and the
program has one drone voice per record. The honest options, in order of size:

1. **A detune on the existing voice** — if `dronebox` has a detune or unison
   control, a shallow slow LFO on it produces the beating the sources describe
   with no new part at all. *Check the instrument first; this may be free.*
2. **A second drone note a fifth or an octave below**, from the same lane —
   `octave` already exists as a field, and a double pedal "two held notes,
   commonly a fifth apart" is already sourced in
   `dungeon-synth-arrangement.md` and already built for the *bass*. The drone
   lane could take the same declaration.
3. **A second drone voice on another instrument** — the largest, and I would not
   start here.

### What I would NOT do

- **Not make the drone's pitch move more.** The sources say the opposite —
  "tuned to a single note… as this is a simple drone" — and dungeon synth's
  1.8 distinct pitches is right. The evolution belongs in the timbre.
- **Not add a new modulator kind.** `lfo`, `arc`, `section`, `apex`, `sh` and
  the Marbles port cover every technique in §1. Adding a sixth would be building
  a thing the file already has.

---

## 5. WHAT I CANNOT CLAIM

I have not listened to either drone. Everything above is read off the code and
counted off composed records — the numbers say boxcar's train is modulated on
six parameters and dungeon synth's is modulated on none, and that dungeon
synth's re-attacks forty times a record. Whether the result *sounds* like an
evolving drone is the ear's, and the ear has not been asked.

---

## Sources

- [How to design an ambient drone with your Eurorack modular synth — MusicRadar](https://www.musicradar.com/how-to/ambient-drone-modular)
- [Creating Drones with Synths — ModeAudio](https://modeaudio.com/magazine/creating-drones-with-synths)
- [How to Make Drones with Granular Synthesis — NodeGrain](https://nodegrain.com/how-to-make-drones-with-granular-synthesis)
- [Learning Synthesis: Quantizers — Perfect Circuit](https://www.perfectcircuit.com/signal/learning-synthesis-quantizers) *(sample-and-hold as the generative element)*
- [The Power of Random Voltages in a Single Eurorack Patch — Reverb](https://reverb.com/news/modular-mayhem-the-power-of-random-voltages-in-a-single-eurorack-patch)
- [Modules for Dark Ambient, Industrial, Drone & Noise — MOD WIGGLER](https://www.modwiggler.com/forum/viewtopic.php?t=182463) *("you can't have enough LFOs and Random generators")*
- [Make a Generative & Evolving Drone Sound with Operator — Ableton](https://www.ableton.com/en/blog/make-generative-evolving-drone-sound-operator/)
- `docs/genre-research/how-a-drone-evolves.md` — the earlier sheet on this repo's own drone
- `docs/genre-research/dungeon-synth-arrangement.md` — the double pedal, already sourced


---

# §6 — WHAT WAS BUILT, AND WHAT IT MEASURED

## 6a. The drone rack has twenty-one knobs and nothing was turning any of them

That is the finding, stated the way it should have been from the start.
`dronebox` carries `voices`, `shape`, `wave`, **`spread` (detune across the
stack)**, `clockA`, `clockB`, `drift`, `cut`, `res`, `peak`, `peakHz`, `swell`,
`fall`, `air`, `strings`, **`dejavu` (the Marbles control)**, `spreadCV`,
`bias`, `curve`, `slope`, `smooth`. Dungeon synth sets `voices: 4, spread: 7,
clockA: 19, clockB: 23, cut: 420` — **a proper evolving-drone machine, with its
knobs held still for the whole record.**

Five motion lanes now, built the way `trainbox` already was. Measured travel,
dungeon synth seed 1, 164 bars:

```
  dronebox.cut       -244.9 .. +514.7   (span 760)   base 420 on a dial to 3000
  dronebox.spread      -5.1 ..   +7.9   (span  13)   base 7 — the beating
  dronebox.level       -0.21..   +0.09
  dronebox.air         -0.04..   +0.06                the sample-and-hold
  dronebox.drift       +0.7 ..   +6.4
```

Periods are coprime and free-phase — 37/53, 17/29, 71/89, 43/59, 23/31, and the
S&H clocked at 13/19 — for the same reason boxcar's train uses 23/31: two cycles
that never line up do not settle into a pattern an ear can learn.

## 6b. And the drone got its own matrix row, which is what makes it automatable

The owner: *"the matrix mixer should be automated also, that's the point of
having it, **every single knob is open game for automation**."* It could not be,
for the drone, because **there was no drone row** — `MIX_ROLE_BUS` said so in its
own comment and put the item in the backlog. That row exists now, with its own
bus and its own five crossings, and two of them are automated:

```
  matrix.droneRoom   -0.411 .. -0.050    routed, so every move is a CUT —
                                         it starts pulled back and the apex
                                         walks the drone into the hall
  matrix.droneEcho   -0.002 .. +0.235    not routed, so it opens from nothing
```

**And `drone` was added to `space.feeds` in the same change.** The Room is open
by default to `keys` and `lead` only, so moving the drone off the keys bus
without that would have taken a cavernous genre's cavern away — the "fixed it by
causing a silence" shape this file has been bitten by twice. Verified after:
`drone into Room = OPEN` on both genres that have one, `shut` on lofi which does
not.

## 6c. THE RENDERER HAS BEEN DEAD, AND THAT IS THE BIGGEST FINDING HERE

Trying to verify any of the above by ear found this:

```
  47 renders, 47 RENDER FAILED: plan.clock.stepAt is not a function
```

**Every render, every section, every song.** Confirmed identical on the build
before this work, so it is not new — and `render_audio.js` is the only tool that
turns this program into a wave file. **That is why nothing gets listened to.**

The cause: `motion.clock` is an object of *functions*, and the renderer hands the
plan to its page through `page.evaluate`, which structured-clones it — and
structured cloning **drops functions and keeps the object**. So every guard of
the form `motion.clock ? motion.clock.x(t) : …` passed on a methodless object.

Guarding each call site was the first fix and it was wrong — the error moved
from `stepAt` to `barAt` to the next one, which is one rule written in five
places waiting to go stale in four. **One owner:** if the clock lost its methods
in transit, a real flat one is rebuilt at the door from the numbers that did
survive. Exact rather than approximate — `makeClock` reports `varies: false` on
20 of 20 records in all four genres, so a flat clock *is* the clock. A genre that
moves its tempo mid-record would want the real one rebuilt from chart and form;
that is named in the backlog, not papered over.

**47 renders, all producing audio.**

## 6d. What the render actually shows, stated at its real size

A/B against a control build — the pre-automation program with *only* the
renderer fix, so the difference is the drone and nothing else. Spectral
brightness per section:

```
  intro      +0.0 Hz      the control working: the arc starts at zero
  verses     -7 .. +10 Hz
  bridge     -0.7 Hz      and -0.41 dB in the drone's band
  outro    +130.1 Hz      and -2.17 dB — the arc fully travelled, level cut
```

**It moves, and it is small.** That is what was asked for — "attenuated so as not
to overpower things", "shallow depths" — but it should not be reported as more
than it is.

**And the section excerpts are the wrong ruler for most of it.** They are nine
seconds long; the slowest lane here has an 89-bar period, which is about six
minutes. A nine-second window cannot show a six-minute cycle. The travel numbers
in §6a are read off the motion plan, which can see the whole record; the renders
confirm the motion *reaches the audio* and cannot confirm its shape. **Fourth
time this session that checking the ruler first has changed the answer.**

---

# §7 — THE CORRECTION THE OWNER'S EAR MADE

§3b of this sheet called dungeon synth's 40 drone attacks a **stutter**. The
owner: *"I'm not hearing a stutter."* Measured properly:

```
  dungeonsynth   792 note-to-note joins · 791 OVERLAP the one before · 1 gap
                 median note 58.2 s
  boxcarsynth     71 joins ·   3 overlap · 68 leave a gap · median 65.1 s
```

**58-second notes overlapping four deep leave nothing to hear as a stutter.**
Those are re-triggers *under a continuous tone* — which is layering, and layering
is the first thing every source in §1 asks a drone for. The count was right and
the word was wrong, and the ear caught it before the measurement did.

`continuous: true` and the unit/material guard from §4 step 1 are **not built**,
and on this evidence should not be until there is a reason better than a number.

---

# §8 — STILL OPEN

- **The layers** (§4 step 3) — `spread` is automated now, so the four voices
  beat against each other over time. A second drone *note* (the double pedal a
  fifth below) is still not built.
- **`dejavu`** — the Marbles control is on the rack and no lane moves it.
- **Boxcar's train has no matrix lanes**, only instrument ones. Its row exists
  now too.
- **The renderer's clock is flat** — correct for all four genres today, wrong the
  day one moves its tempo.
- **Nobody has heard it.** The renders exist now, which is new; nobody has
  listened to them.

---

## POSTSCRIPT, 2026-08-19 — THE BOW

> "I think you were right about the drone rack stuttering, it sounds like a bow
> being drawn across a stand up bass."

**He is right, and the measurement in this sheet that said otherwise was mine
and was the wrong question.**

That measurement asked whether the drone's notes **overlap**. They do — 791
joins of 792, median note 58 seconds — and I concluded from it that there was no
stutter and that `drone.continuous` was not needed. **Overlap is not the
question. The attack is.**

Measured properly, dungeon synth seed 1:

```
  41 drone notes in a ten-minute record
  each 58.2 s long, A NEW ONE EVERY 14.5 SECONDS
  all on one pitch, at one gain
  and V.dronebox swells every one of them in over 3 seconds
```

Four copies of one note sounding at once, and a fresh three-second crescendo
beginning every fourteen seconds. That is not a drone with movement in it. **It
is a bow, lifted and drawn again, forever.**

### And the fix was already built

`drone.continuous` — the merge that turns a chain of abutting drone events into
one — was written for **the train** on 2026-08-15, after the same complaint in
different words ("the train is fading in and out this is wrong"). It has sat in
stage 5 ever since, **declared by no genre at all**, including the one it was
written for.

One line each on the two genres that have a ground:

```
  dungeonsynth   41 notes  →  1 note, 640 seconds
  boxcarsynth     3 notes  →  3 (its `cut` stops the train at each town — correct)
  lofi, synthwave            no drone, 0 of 12 records changed
```

Rendered: **−6 to −10 dB below signal** of change, 0 of 47 renders failed, and
the record comes out slightly *quieter* — four stacked copies of one note were
adding about a decibel that nobody asked for.

### The lesson this repo keeps re-learning

*When a measurement surprises you, suspect the measurement first* — and the
corollary this one adds: **a measurement that agrees with you is the dangerous
one.** The overlap figure told me what I wanted (the owner's ear was wrong, no
work needed) and I stopped there. His ear was right both times: right that
"stutter" was the wrong word, right that something was being re-articulated.
