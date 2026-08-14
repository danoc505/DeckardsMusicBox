# Modulation — what this program has, what it cannot express, and what eurorack already solved

Written 2026-08-13, in answer to five questions:

> *"Did we create LFOs for our drones? What about all the data i provided on
> drones? We should be copying the open spurce mutable instuments open source
> euro rack moduals for this. We should be learning about eurorack generative
> music and how to modulate how do you use a lfo to modulate an lfo? Can we add
> lfos to many of our fx racks? Where else can we use them and what other
> eurorack units should we be using"*

Measured first, researched second. Everything in §1–§2 is read off the program.

---

## 1. Yes — and there are more of them than I expected

Measured across all ten genres, seed 1:

```
  controls the program declares        559
  lanes at least one genre modulates   435   (78%)
  moves in play    lfo 616 · section 250 · apex 107 · arc 62 · gesture 50
                   occurrence 43 · plock 25 · throw 14 · phrase 14 · snap 6
  LFO rates        8 to 160 bars per cycle
```

616 LFOs, the slowest turning once every 160 bars. So "we have no slow LFOs"
is not the fault. Hobbit synth alone carries 121 live motion lanes.

Per rack, controls declared vs ever modulated:

```
  tr1000  82/72     matrix  49/39     echo    7/5      rhodes  6/5
  kit     69/67     tb303   36/27     vp330   7/5      wurly   6/5
  amen    65/65     cs80    17/11     horns   7/6      desk    6/3
  segakit 62/62     dp4     12/8      carnyx  7/4      comp    6/0  <- never
                                      mellotron 8/6    sax    13/0  <- never
```

**So the answer to "can we add LFOs to many of our FX racks" is that they are
mostly already there.** The echo, the matrix, the DP4, the spring and the tape
are all modulated by several genres. What is missing is not MORE LFOs.

---

## 2. What is missing is that a modulator cannot be modulated

`motionAt`, the whole of the LFO case:

```js
else if(mv.kind === "lfo"){
  const ph = mv.phase + (bar * STEPS + step) / (STEPS * mv.bars);
  d += mv.depth * MOTION_WAVE[mv.shape](ph - Math.floor(ph));
}
```

`mv.bars`, `mv.depth`, `mv.phase` and `mv.shape` are drawn once, frozen with
the plan, and never read again. And two moves on one lane are **summed**.

Three consequences, and the third is the one that matters:

1. Two LFOs on a lane give **beating** — the coprime pairs on `erangStrings`
   and `erangHarp` (71/89 against 23/29/17) are real and they work. That is
   addition, and addition is a legitimate technique.
2. But an LFO's RATE never changes, so its period is a constant of the record.
   A 160-bar cycle is slow; it is not *evolving*, it is *long*.
3. **Nothing in this program modulates a modulator.** There is no LFO into
   another LFO's rate, no LFO into another's depth, no cross-modulation, no
   sample-and-hold, no probability at play time. The vocabulary is: constants,
   fixed periodic functions, and the song's own shape.

That is the honest answer to *"how do you use a lfo to modulate a lfo"* — in
this program, you cannot. Nothing is stopping it but the shape of one `if`.

### 2.1 And of the seven things you gave me for drones, one got built

From the three articles and the technique list handed over on 2026-08-12:

| | |
|---|---|
| slow LFOs | **BUILT** — 616 of them, out to 160 bars |
| neighbour tracks | not built |
| scenes | not built (backlog task #63) |
| infinite feedback / max send on delay | **NOT EXPRESSIBLE** — `echo.fb` is declared `[0 .. 0.85]`. There is no way for a genre to ask for near-unity |
| very short delay time | **NOT EXPRESSIBLE** — `echo.div` is `[1 .. 8]` *beat divisions*. Milliseconds are not a thing this delay has |
| rtrg / rtim synced by a slow LFO | not built |
| one loop of radio frequencies for harmonics | not built |

One of seven. The two marked NOT EXPRESSIBLE are the same object under two
names — a short delay at near-unity feedback **is** a resonator — and that is
already backlog task #62, unbuilt since it was written.

---

## 3. Mutable Instruments — and yes, it is genuinely ours to read

> **CORRECTION, added 2026-08-14, in answer to a direct question.** The owner
> asked: *"Did you build both of the mutable instruments you mentioned using the
> open source free code for them?"*
>
> **No. I did not read one line of `pichenettes/eurorack`.** What I read was the
> repository's *front page* — the module list and the licence block quoted below
> — and the **manuals** for Marbles and Tides, which are prose documents on
> `pichenettes.github.io`, not source. Marbles' DÉJÀ VU, SPREAD and BIAS and
> Tides' SHAPE / SLOPE / SMOOTHNESS were then re-implemented as my own
> JavaScript arithmetic inside `makeMotion` and `motionAt`, from the *described
> behaviour*.
>
> So what is in the file is **the idea, not the implementation**. No C++ was
> fetched, read, translated or ported; none of Émilie Gillet's code is in this
> program; the `t_gen`, `random_sequence` and `ramp_extractor` sources that do
> the real work in those modules were never opened. The paragraph below —
> "porting the *ideas* into this program is exactly what the licence is for" —
> is accurate about the licence and was written before anything was built, and
> it should not be read as a report that a port happened. It did not.
>
> **FOLLOW-UP, 2026-08-15, and the correction now has a correction.** The owner:
> *"isnt mutable instruments open source free code? Why are we not using it?"*
> No good answer existed, so the source was fetched and read this time:
> `marbles/random/random_sequence.h`, `marbles/random/t_generator.cc`, and
> `tides2/poly_slope_generator.h`, raw from `pichenettes/eurorack` (MIT).
> Three things in this program are now PORTS of that code rather than guesses
> from the manuals, and each carries the attribution in its comment:
>
> 1. **`MarblesSequence`** in stage 3 — the deja-vu core. The real mutation
>    probability is `p = (2·dejavu − 1)²`, a parabola that is ZERO at the notch;
>    below it a mutation REWRITES a loop slot (the loop erodes and keeps
>    playing), above it the read JUMPS across an unchanged loop. My guess used
>    linear ramps and drew fresh noise below the notch — a different instrument.
>    The generative lead uses the port directly; the drone rack's live register
>    and the modulator bank's deja-vu mode were corrected to the same curve and
>    semantics in stateless form.
> 2. **`tGenerate`** — the t-section's drum-pattern model: a bank of 8-step
>    patterns read by BIAS, the same RandomSequence deciding loop/erode/jump per
>    bar, and the module's own `jitter⁴` taper. Consumed by ambient's figure.
> 3. **Tides' SMOOTHNESS, corrected** — it is BIDIRECTIONAL from a clean centre:
>    a wavefolder one way, a one-pole lowpass the other, with a fourth-power
>    taper. My "stepped to smooth" was a misreading and is gone.
>
> What is still NOT a port: the DSP topology (this program is WebAudio graphs,
> not sample loops), Marbles' X-channel voltage processing, Tides' wavetable
> bank. Those remain adaptations, and the paragraph below still applies to them.
>
> This matters in two directions and both are worth stating — and the first
> half is now SCOPED by the follow-up above: as of 2026-08-15 the three named
> ports ARE derived work, carry Gillet's copyright notice in their comments as
> MIT asks, and the "nothing here is derived" sentence below is true only of
> everything else. It was **honest
> about provenance**: nothing else here is derived work and there is no
> attribution obligation quietly skipped. And it is **honest about fidelity**: a
> re-implementation from a manual is a guess at the algorithm. Marbles' real
> déjà-vu is a specific interpolation between a fresh draw and a stored loop
> with a documented notch at 12 o'clock; what is in this file is *a* function
> with that shape, and whether it behaves like the module under a knob sweep has
> not been tested against the module, because the module has not been consulted
> at the level where that question lives.

`github.com/pichenettes/eurorack`, Émilie Gillet. 27 modules.

> Code (STM32F projects): **MIT license**
> Code (AVR projects): **GPL3.0**
> Hardware: **cc-by-sa-3.0**

MIT on the DSP is as permissive as it gets. The designs have already been
ported to VCV Rack, Max and a dozen hardware clones, so porting the *ideas*
into this program is exactly what the licence is for. What follows is what
each one answers that this program currently cannot.

### 3.1 Marbles — and this is the answer to the drone question

The question asked weeks ago and never properly answered:

> *"The issue with drones is you cant figure out how to make something that
> goes on and on while also allowing it to have evolution."*

I answered it with parameter locks, researched that, and found the premise
half wrong. **Marbles answers it in one control.** From the manual:

> *"DEJA VU is a parameter that increases the probability of re-playing past
> material to the point that the generated output forms a loop, then increases
> the probability of randomizing the order of this loop."*

One knob, three regions:

```
  hard left    pure novelty — every value new
  centre       a PERFECT LOOP, 1 to 16 steps, with a virtual notch so you can
               find it by feel
  hard right   the same loop, its order progressively shuffled
```

That is not a compromise between repetition and change; it is a **continuous
dial between them**, and either end is reachable. It is precisely the thing a
drone needs and precisely what this program has no way to say.

Two more of its ideas matter as much:

- **LENGTH is separate from déjà vu.** The loop is 1–16 steps and can be
  changed while it runs, so the same material re-phrases.
- **SPREAD and BIAS re-map a loop that is already running** — *"once a
  sequence is looping, it is still possible to alter it with SPREAD/BIAS to map
  it to a different range of voltages."* Evolution WITHOUT re-randomising. The
  figure stays; where it sits moves. This program has no equivalent at all.

### 3.2 Tides — one modulator, four related outputs

A modulation source whose shape is itself a set of controls:

- **SHAPE** — the curve of the rise and the fall (linear / exponential /
  logarithmic combinations)
- **SLOPE** — *"the ratio between the durations of the ascending and descending
  segments"*: from an instant attack with a full-cycle decay through to its
  mirror
- **SMOOTHNESS** — below centre a low-pass on the CV itself, above centre a
  **wave multiplier** (it folds, adding harmonics to the modulation)
- **four outputs** that are *"detuned, de-phased or cross-faded"* versions of
  one another, with one control setting the amount of that spread
- free-running down to **one cycle per two minutes**

The four-outputs-from-one-source idea is the coprime-LFO trick done properly:
related motion on several destinations from a single generator, instead of
independent LFOs that merely happen not to line up.

### 3.3 The rest, and what each one is FOR here

| module | what it is | the gap it fills |
|---|---|---|
| **Warps** | meta-modulator: cross-modulates two signals | the literal answer to "modulate a modulator" |
| **Kinks** | rectifier, analogue logic, **sample & hold**, noise | S&H of one slow LFO clocked by another is *the* classic generative stepped-random CV, and we have nothing like it |
| **Branches** | dual **Bernoulli gate** — a trigger goes one way or the other with probability p | probability at PLAY time. Every draw here happens once, at compose time |
| **Stages** | segment generator — a chain of segments that loops | our `arc` and `apex` are fixed two-point curves; this is their general form |
| **Rings** | resonator | task #62, verbatim |
| **Clouds / Beads** | granular texture synthesis | the §6.3 answer in `playing-a-sampled-instrument.md`, for material too short to sustain |
| **Grids** | topographic drum sequencer — a 2-D map you *move through* rather than a list of patterns | the drums complaint: "might not be one loop but it feels like it" |
| **Plaits / Braids** | macro-oscillator, one algorithm per model | the voice bank's own shape already |
| **Frames** | keyframer — interpolates a whole set of levels between saved scenes | **scenes**, from the drone list. Task #63 |
| **Shades / Blinds** | attenuverters, VC polarisers | a modulation depth that can go NEGATIVE, and be modulated |

### 3.4 The patch idiom, in the sources' own words

> *"Take two LFOs that both have FM CV inputs, modulate the rate of the first
> one with the output of the second one, and also modulate the rate of the
> second one with the output of the first one, then patch both LFO outputs to a
> mixer."*

> *"You can also do more complex and chaotic arrangements, like LFO1 > LFO2 >
> LFO3 > LFO1 in a FM 'loop', and then use any one, any two, or all three LFOs
> mixed together and send them all to various different destinations."*

> *"Generative patches are created by connecting modules in such a way that they
> basically play themselves with little or no interaction from the user, yet the
> music evolves and changes without repeating itself."*

The last sentence is this program's entire brief, written by somebody else.

---

## 4. What follows for this program

In the order of how much each buys against how much it costs.

1. **A move may be modulated by another move.** One change in `motionAt` and in
   the draw: `depth` and `bars` become lanes in their own right rather than
   numbers. That single change gives LFO→depth, LFO→rate, the FM loop, and
   Tides' SLOPE — everything in §3.4 — and every one of the 616 LFOs already
   in the tables becomes a possible source or destination.
2. **`déjà vu` as a declarable property of a generative lane.** A loop of N
   drawn values, a probability of re-using rather than renewing, and a
   probability of shuffling. This is the drone answer and it is small.
3. **The resonator** — short delay, near-unity feedback (tasks #62). It needs
   `echo.fb` to be able to exceed 0.85 and `echo` to be able to speak in
   milliseconds, neither of which it can today.
4. **Sample & hold, and a Bernoulli gate** — stepped random modulation, and a
   coin that is flipped while the record plays rather than while it is written.
5. **Scenes** (Frames) — a saved set of levels, interpolated between. Task #63.
6. **`comp` and `sax` are never modulated by anything**, which is a smaller and
   duller finding than the rest but is a fact and is cheap to fix.

Nothing above is a taste decision about how any genre should sound. Every one
is a thing a table currently *cannot say*.

---

## 5. Ambient drone, and eurorack generative practice — the second question

> **NOTE ADDED 2026-08-14b, and it is against myself.** This section existed a
> day before the `ambient` genre was written and **I did not open it while
> writing that table.** Its §5.4 and §6.4 name generative PITCH — a `sh` or a
> `dejavu` on a note rather than on a knob — as the obvious next thing and as
> not built, and an ambient genre built around a drone is the genre that most
> wants it. It is still not built. The Krell patch is now written out as an
> actual algorithm in `docs/genre-research/ambient.md` §4b, which is where the
> follow-up research went; §5.1 below is the one-line version of it.

> *"Did you do any research on ambient drones, and generative music via eurorack"*

**Ambient drone: yes, and it predates this sheet.**
`docs/genre-research/how-a-drone-evolves.md` — sixteen searches, twenty-two
page fetches, seven traditions (gamelan, pibroch, alap, ground bass, Eno,
dub techno, dungeon synth), written after the challenge *"How do you know what i
said about plocks is correct in regards the drones? Did you research it?"* Its
verdict is the thing this whole line of work is executing:

> *"What the sources put the heavy lifting on, in order: **parts entering and
> leaving**; **cycles whose periods do not divide each other**; and **discrete
> variation events over an unchanged ground**. Those three are what every one of
> the seven traditions surveyed here converges on, and this program has the
> first, has never had the second, and has the third only at the record scale."*

The coprime LFO pairs are the second. `dejavu` is the third. Neither is my idea;
both are that sheet's findings, finally built.

**Eurorack generative practice: it was thin, and this is the fix.**

### 5.1 The Krell patch

The canonical generative patch, Todd Barton's, after *Forbidden Planet*:

> *"A random value generator determines both the notes played by the oscillator,
> and the decay times of the notes."*

One source, two destinations, and the second is TIME. That is the idea `sh`
carries here — a drawn value that also decides how long it lasts — and it is why
`every` is drawn rather than fixed.

### 5.2 Sequences of different lengths

> *"Blending sequences of different lengths with a precision adder can be an
> effective way to create long varied melodies from shorter source material."*

> *"Multi-voice polyrhythms that involve coprime ratios can lead to very long
> cycles of many millions of pulses."*

This is `how-a-drone-evolves.md`'s second mechanism stated by a different
tradition, and it is why the two dungeon-synth kettle filters step on 48/80 and
64/112 rather than on the same period.

### 5.3 Probability, and where it belongs

> *"Probabilistic skippers for gate pulses and CVable clock dividers/multipliers
> can be used for further manipulation of timing signals."*

> *"Clock dividers, logic, and sequential switches can be great for triggering
> semipredictable, structured changes."*

`bernoulli` is the first of those and is built. Clock dividers and sequential
switches are not, and they are the shape of the answer to *"the drums might not
be one loop but it feels like it"* — a hit that sometimes does not happen, and a
lane that changes on its own period rather than the bar's.

### 5.4 Quantisation

> *"A melodic variation on the Krell patch uses a Quantizer on the Random for a
> more melodic take."*

Worth naming because this program already has the quantiser and does not think
of it that way: `scaleStep`/`inKey` are exactly that, and nothing generative
currently feeds them. A `sh` or a `dejavu` on a PITCH rather than on a knob is
the obvious next thing and is not built.

### 5.5 And the honest summary of what generative means here

> *"Generative patches are created by connecting modules in such a way that they
> basically play themselves with little or no interaction from the user, yet the
> music evolves and changes without repeating itself."*

Which is this program's brief, written by somebody else, and the measurable form
of it is the last column of `probe_modulation.js`: of the lanes that move, how
many never come round again.

---

## 6. What is now built, and what is still not

**Built** — four move kinds with memory (`fm`, `sh`, `dejavu`, `bernoulli`),
resolved at draw time into a per-sixteenth curve; declared on **all ten
genres**, not only the drone; `probe_modulation.js` proving every kind resolves
on every genre and that every declared curve moves; `probe_drone.js` taught to
measure long-term periodicity rather than only within-bar detail.

**Found 2026-08-14e, by asking "is this hooked up properly?" of every
destination instead of the two that had been demonstrated:** the modulator
bank was DEAD on any destination the current genre did not itself automate.
Two guards, one defect: `rideBus` returned early when the genre had no motion
lane on a key, and `motionAt`'s first line returned 0 for a laneless key before
reaching the `handModAt` addition at its end. So a bank slot on DRUM ROOM
worked on a genre that moves its drum room and silently did nothing on one
that does not — and the person at the panel could not know which. Both guards
now also ask whether the HAND has a modulator patched. Proved by render A/B on
a laneless key: −100 dB of numerical dust before, −43.7 dB after, against
−37.6 dB for the known-good laned calibration on the same A/B. In the same
build the bank's destinations went from 12 to 22 — every part bus's room, echo
and spring send, and the echo→spring dub route. TAPE WOW was added and then
REMOVED in the same commit: the tape reads its knobs at graph build and is
never bus-ridden, so it would have been a socket that does nothing.

**Closed since this list was written** (2026-08-15 build): the **resonator**
(task #62 — a comb on the echo's return, pitch 1/f, feedback to 0.99, ridden
mix); **generative PITCH** (the Krell lane, now running the ported
RandomSequence); **`comp`** (threshold ridden by rideBus, a bank destination,
"breathing" reachable); **`sax`** (four dormant lanes on bladerunner that wake
when a hand loads one); and **LFO-into-LFO by hand** (the bank's four MOD AMT
cross-patch destinations, and the drone rack's LFO 2 into LFO 1's rate or
depth with integrated phase).

**Still not built, and named rather than dropped:**

1. ~~Scenes~~ **built 2026-08-15b** — STORE A / STORE B / crossfader on the
   modulator bank's glass, morphing every hand TRIM between two captured desk
   states, switches snapping at the midpoint. Task #63's other half (serial
   routing) remains: the honest design is a RES column on the matrix so any
   part can feed the resonator directly, and it is not built because the
   matrix's builder, `routeBaseFor` and `probe_wiring` all walk the column
   list and a rushed column is a broken desk.
2. **Clock dividers and sequential switches** (§5.3) — a lane that changes on
   its own period, at play time, outside the drone rack and the bank.
3. **Marbles' X-channel processing and the t-section's other two models**
   (complementary Bernoulli, clusters) — the port took the drum model only.
4. **Neighbour tracks / serial routing** — the resonator is serial on the
   echo's return, but a general "this track processes that track" is still
   not expressible.

## Sources

- Mutable Instruments, `pichenettes/eurorack` — https://github.com/pichenettes/eurorack
- Marbles manual — https://pichenettes.github.io/mutable-instruments-documentation/modules/marbles/manual/
- Sound On Sound, *Mutable Instruments Marbles* — https://www.soundonsound.com/reviews/mutable-instruments-marbles
- Tides v2 manual — https://pichenettes.github.io/mutable-instruments-documentation/modules/tides_2018/manual/
- SchneidersLaden, *Mutable Instruments Tides 2* — https://schneidersladen.de/en/mutable-instruments-tides-2
- Gearspace, *Modulating an LFO with another LFO* — https://gearspace.com/board/electronic-music-instruments-and-electronic-music-production/774546-modulating-lfo-another-lfo.html
- MacProVideo, *Making Generative Music With Eurorack Synths* — https://www.macprovideo.com/article/audio-hardware/making-generative-music-with-eurorack-synths
- Learning Modular, October 2020 newsletter (cross-modulation) — https://learningmodular.com/2020-10-newsletter/
- Perfect Circuit, *Mutable Instruments: a (Brief) Retrospective* — https://www.perfectcircuit.com/signal/mutable-instruments-retrospective
