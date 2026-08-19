# THE EVOLVING DRONE — the parts are all here, and one genre's drone stutters

*2026-08-19, at the owner's direction: "research how to make evolving drones,
and making evolving drones in eurorack… We should have the needed things to do
this and yet we don't have an evolving drone. Diagnose the issue with your
research and tell me your plan."*

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
