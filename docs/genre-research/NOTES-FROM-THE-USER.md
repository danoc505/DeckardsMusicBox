# The three transcripts on `main`, read

`Min Tech 001`, `Blade Runner 001`, `Blade Runner 002`. These are the primary
material for this pass. Everything below is what those files actually say, with
the web research that corroborates or extends it kept separate and marked.

ALWAYS READ THE NOTES. This file exists so the next coder reads them too.

---

## 1. `Min Tech 001` — minimalism in electronic music (Oscar / Underdog)

The single most useful document in this repo for the Plastikman genre, because
it is not about a record, it is about the **method**. Four ingredients, in his
order:

### 1. A groove at every level — lows, mids and highs

> "make sure that there is a groove happening at all levels of your track — so
> in the lows, in the mids and in the highs"

And a groove is explicitly **not** a drum hit:

> "a groove is slightly more than just drum hits — it's at least two elements
> that are bouncing off of each other in some interesting way"

He demonstrates it as a kick alone ("this again is not a groove") becoming a
groove only when a second element is added against it. Same for the hats. This
is a *pairing* rule, not a density rule.

**Status in the program:** NOT built. The kit has lanes, not pairs, and nothing
in any table expresses "these two elements bounce off each other." This is the
largest single gap between the notes and the code.

### 2. Movement in the timbre of each element

> "no movement is boring, too much movement is exhausting, and just the right
> amount of movement is interesting and stimulating"

Sources of movement he names: phasers, choruses, flangers, delays with an LFO on
the delay *time* (which pitches the repeats up and down), filter cutoff,
envelope lengths — "basically any parameter that changes the timbre".

And a technique that is genuinely different from automation, worth its own line:
**freeze, flatten, and loop a slice of the movement.** Print the wildly-moving
version to audio, then take a section of it and loop that — so the element has
movement *baked in* that repeats, rather than movement that keeps evolving. He
is explicit that this produces expressions "you wouldn't necessarily get if you
automated it consciously".

**Status:** the five motion kinds (`plock`/`lfo`/`section`/`gesture`/`arc`) cover
continuous automation well. The freeze-and-loop idea is not built and is a real
idea — a *repeating* movement is not the same as a slow LFO.

### 3. Polymeters

Loops whose length is **not a clean multiple of one bar**, so they never restart
at the same place.

> "one polymeter is almost always welcome, two polymeters is probably still
> fine, but above that maybe it gets a bit crazy"

And the arrangement move that goes with it, which is the one worth stealing:

> "you remove the kick, you remove the hi-hat, you move the clap — now all
> you've got is this polymeter, and because it doesn't line up with the one,
> people on the dance floor are going like 'oh where was the one again'"

**Status:** NOT built. Every pattern in the program is 16 steps. The *breakdown*
half of it is now expressible — Plastikman's `bridge` role list is down to
`["ostinato"]` alone — but the ostinato it leaves running is still bar-aligned,
so the disorientation that makes the move work is absent.

### 4. Tension and release, and making them wait

> "build up all the frequencies creating a wall of sound almost like white noise
> and then cutting that to create space between elements so that the purity of
> each element becomes clearer"

> "especially in minimalist music, don't be afraid of making your audience wait —
> let them get more invested in your music before giving them any kind of payoff"

Also names reversed reverb tails as the riser, then **silence**, then a clean
beat.

**Status:** this is what `desk` was built for — cutting a band *is* the release,
and no arrangement change gets you there because the notes do not change, only
what is let through. "Making them wait" is what `form.build.enter` does.
Reversed reverb tails are not built.

---

## 2. `Blade Runner 001` — the Deckard's Dream / CS-80 walkthrough

### The instrument

- **Imperfection is the point.** "what makes the CS-80 popular is its
  imperfection — it's not fat, doesn't sound like a Moog in its fatness, but it
  just sounds very epic and cinematic, and that's because the tuning is all over
  the place." He returns to this twice, and says virtual instruments usually fail
  to replicate the tuning irregularities.
- Two oscillators, eight-note polyphonic. **Each oscillator has its own
  independent low-pass AND high-pass filter.**
- Per oscillator: PWM, square or sawtooth, LPF + HPF, initial level, attack
  level, an ADR for the filter, VCF level, a sine sub, then ADSR on the
  amplifier.
- A **duplicate control set for aftertouch** — the aftertouch routings are their
  own page of the panel, not one depth knob.
- "Touch response", and key tracking on brilliance.
- Global **brilliance** and **resonance** after the two channels.
- Sub-oscillator, coarse tune, fine tune, and **detune between the two
  oscillators**.
- Portamento, including a **quantised portamento** (glissando) mode.

### The half that is not the synth

> "the sounds, the root source sounds, is only half of what Vangelis was about…
> he was as much a sonic explorer, a fantastic user of reverbs and delays, as he
> was a composer"

He then builds the demo out of: a big stereo reverb ("I'm going to go really
big"), delays, chorus, a layered "mega drone", a plucked/janky "splang" standing
in for a koto, a piano doubling it, and **crotales/bells**. And: "lots of tuning
down into the depths of different octaves".

---

## 3. `Blade Runner 002` — the brass sound (Dr Mix, on a Moog Muse)

A step-by-step recipe for the specific sound. In order:

1. **Osc 1 is a plain sawtooth.** A little attack on the VCA, some decay,
   sustain, a touch of release — "that's a pad".
2. **A low-pass filter with envelope and resonance** is what makes it brassy.
3. **Also a high-pass filter**, with "a decent amount of envelope" and its own
   resonance. (He hedges — "we think" — so this is his reconstruction, not a
   documented fact.)
4. **Osc 2 is a square wave with variable pulse width**, pushed to one extreme.
5. **An LFO on osc 2's pulse width.** This is the answer to the question the
   video opens with — the "phasing thing" you can hear in the original: "that
   sort of modulation is what I believe makes the sound very special."
6. **Aftertouch → osc 2 pulse width, NEGATIVE**, so pressing *reduces* the PWM.
7. **A slew/lag on the aftertouch source** — "to make it a little bit less
   hysterical."
8. **Aftertouch → filter cutoff** as well, also slewed.
9. **Oscillator drift/instability on the pitch**, on both oscillators: "this
   really sells it."
10. A long reverb — a couple of seconds, "diffuse" on.

Note how much of this is *aftertouch routed to timbre, smoothed*. That is the
part the program does not model: see below.

---

## 4. Web research (marked separately — not from the user's files)

### The ribbon, which the program has wrong in a specific way

- The CS-80 ribbon **has no centre position**. Where you first touch it is the
  starting point. [corpus:soundonsound CS-80]
- Range is asymmetric and large: about **+1 octave** sweeping one way, and the
  other way it goes "from the keyboard's highest pitch right down to a sub-audio
  frequency." [corpus:soundonsound]
- It produces **polyphonic glissandos** — it bends everything sounding *together*,
  because it is one finger on one strip. [corpus:perfectcircuit]
- Vangelis's descending slides near the end of *Tears in Rain* are this control.
  [corpus:reverbmachine]

**The error this names.** The program's ribbon is drawn **per note**, on its own
substream, for `lead` and `keys` independently. So a chord's notes each bend by
a different amount at a different moment — which is not a ribbon, it is four
players with four pitch wheels. A ribbon is ONE gesture applied to every note
currently sounding. This is unbuilt work and it is the user's point: "the ribbon
was played almost like its own instrument."

### Polyphonic aftertouch is the other half, and it is time-varying

- The CS-80's poly aftertouch controls "modulation speed and depth, volume and
  brightness… at the mercy of your fingers", per key. [corpus:perfectcircuit,
  corpus:soundonsound]
- Reverb Machine on the brass: "you'll hear the brass sound subtly changing in
  brightness and intensity from note to note, giving the performance an almost
  orchestral quality." [corpus:reverbmachine]

**The error this names.** In `V.cs80`, `const touch = Math.min(1.2, ev.gain)` —
touch is the note's *velocity*, a single number fixed for the note's whole
length. Real polyphonic aftertouch is **pressure applied during the note**, a
curve, per note. Nothing in the program has a per-note expression curve. That is
what "it is MPE and it feels more than pitch bending" is pointing at, and it is
not built.

### Plastikman / Hawtin

- "Consumed is an album of feedback. Everything was cross-modulating everything
  else." — Hawtin. Most tracks recorded **live to 2-track DAT in a single take**
  and edited down. [corpus:wikipedia/Consumed]
- Plastikman was deliberately a move *away* from his own acid reputation, "to
  create something more subtle and sexy". [corpus:gearnews]
- The 606 mattered as much as the 909: "many drums came from the 606 — which had
  one mono out, and hi-hats were different little pots, so mixing happened that
  way." [corpus:technomusicnews]
- Arrangement, from a production guide rather than from Hawtin: minimal techno
  "evolves through micro-variation (filtering, panning, tiny automation), not
  through adding new parts", and "the most powerful arrangement move is not
  adding a new element" — small changes should feel significant.
  [corpus:beatkey]

That last one is in tension with "starting small and building up", and the
tension is real rather than a contradiction to resolve away: parts arrive
*rarely* and *far apart*, and between arrivals the movement is all timbral.
`form.build.enter` spaces four arrivals across 300 bars; `motion` does the rest.

### Transcriptions — what actually exists

The user asked whether transcribed Blade Runner and Plastikman songs can be
found. Honestly:

- **Blade Runner: yes, in usable form.** "Blade Runner Blues" and "Tears in Rain"
  both have published piano sheet music and multiple chord transcriptions.
  Reverb Machine's two teardowns are more useful than any of them because they
  are *patch and arrangement* analyses rather than note lists.
- **Plastikman: effectively no, and it is not an accident.** There is no
  meaningful note content to transcribe — one chord, no functional harmony. This
  repo already measured that: Essentia's key detector split 42 tracks 22 minor /
  20 major at a median key strength of 0.55, i.e. it found no harmony to detect.
  The nearest thing to a transcription is Attack Magazine's step-by-step
  "Spastik-style" beat construction, which is a *rhythm* transcription:
  quarter-note 808 kick with a highpass at 82 Hz released on the drop, 32nd-note
  808 snare rolls with two specific delayed 32nds, closed 909 hats on all four
  16ths panned right with velocity randomisation, a reversed 707 open hat, and
  two ride layers. That is the right shape of source for this genre.

**So: for Plastikman, stop looking for notes and transcribe the MOVEMENT.** The
user has been saying this: "the effects, the movement of the parameters — this
is where the music is."

---

## 5. `CS-80` on `main`, plus the panel screenshot — the performance envelope

The single most important idea in this repo's research, and it is an
**architectural** claim, not a sound-design one:

> "A Blade Runner patch should **not be stored as one fixed preset**. It should
> be stored as a **performance envelope**: a range of possible states the
> musician moves through."

And the number that goes with it:

> "The static patch is only about 40% of the sound."

The file is honest about its own status and that honesty should be preserved
when citing it: there is **no archive of verified original Vangelis CS-80 knob
positions**. The settings were never released. What exists is factory presets he
is believed to have started from, modern recreations (Arturia CS-80V, GX-80,
Deckard's Dream), ear-matched reverse-engineering, and performance settings. Its
own sources are Arturia forum threads. Treat every number in it as a
**programming target**, not a measurement. It says so itself.

### The 60% — what the sheet ranks

| Performance element | Importance |
| --- | --- |
| Polyphonic aftertouch | Extremely high |
| Ribbon controller | Extremely high |
| Manual filter opening | High |
| Long reverb tail | High |
| Slight detuning | Medium |
| Oscillator waveform | Medium |
| **Exact slider position** | **Lower than expected** |

> "This is why people chasing the exact knob positions often fail: the CS-80 was
> designed as a performance instrument, not a preset machine."

### What the panel screenshot confirms structurally

The Arturia CS-80V panel is a spec, not a picture. Two channels, I and II,
mirrored. Per channel: LFO mode (FREE/TRIG/MONO), waveform, speed, PWM and PW,
sync, noise; a VCF block with 24 dB / HPF / LPF switching, **both** an HPF and an
LPF each with its own RES, then IL / AL / A / D / R; a VCA block with VCF level,
A / D / S / R and level.

And the block that matters most here:

**TOUCH RESPONSE is two sub-blocks per channel — INITIAL and AFTER — and each
has its own BRILL and LEVEL slider.** Below, a global TOUCH RESPONSE section
routes aftertouch to BEND, SPEED, VCO and VCF. So aftertouch→brightness and
aftertouch→level are independent depths, and aftertouch also reaches pitch and
LFO rate. There is also a RIBBON section with its own PITCH switch and COURSE /
TUNE, sitting apart from the wheel — it is its own controller, exactly as the
user said.

### What was built from this, and what it measured

Two controls, and **the program had their polarity backwards**:

- **The ribbon is ONE hand on ONE strip.** It was drawn per note on a substream
  keyed by role and step, so every note of a chord bent by a different amount at
  a different moment. It is now drawn once per BAR, keyed on the bar alone, and
  every note still sounding when the hand lands takes the same bend — which also
  means two roles computing it independently arrive at the same gesture with no
  plumbing between them. Measured: **224/224 and 451/451 simultaneous groups
  agree, 0 disagree.**
- **The aftertouch is PER KEY.** It did not exist: `touch` was
  `Math.min(1.2, ev.gain)` — velocity, one number for the note's whole length,
  i.e. only the INITIAL column of the panel. `ev.press` is now a per-note
  pressure *curve*, realised as a ConstantSourceNode summed into cutoff, level
  and vibrato depth at three separate depths (`atBrill` / `atLevel` / `atVib`,
  defaulted from the sheet's 80 / 20 / 40). Measured: **4291/4291 and 1478/1478
  chords move independently.**

  It was wrong first, and measurement caught it: the substream key was
  `role:bar:step`, and every note of a chord shares all three — so 694 of 951
  chords moved as a block. That is *channel* aftertouch, the exact thing poly
  aftertouch is defined against, and it would have shipped looking correct.
  Keying on pitch as well fixed it.

Audio, same held note with and without a finger, zero crossings per 0.2 s: 2792
→ 3155, with the gap opening in the middle of the note (1.4 s: 106 → 146). With
every AFTER knob at 0 it is exactly 2792 — so the change provably comes from
those knobs.

### What is STILL not built from this file

Written down rather than implied, because the file is a spec and most of it is
unimplemented:

1. **`params` are still POINTS, not RANGES.** This is the file's headline idea
   and it is the one thing not done. `vangelis.params.cs80` is a set of fixed
   numbers plus `motion` on top. The performance-envelope idea says the base
   itself should be drawn per song from a constrained range — the file even
   gives them: PWM 40–60%, cutoff 35–60%, resonance 5–20%, attack 0–150 ms,
   release 2–8 s, detune 2–8 cents, aftertouch brilliance +20–60%. A `paramRange`
   block alongside `params`, drawn once per song on its own substream, would be
   a small change and is the highest-value remaining item in this document.
2. **Two independent channels.** `V.cs80` has two layers, but they share one
   filter topology and one envelope shape; the real thing has a full independent
   VCF and VCA per channel, and the sheet specifies different values for each
   (16' vs 8', cutoff 4.5 vs 5, release 3.5 s vs 5 s).
3. **Both HPF and LPF resonant per channel** — the voice has a resonant HPF but
   its Q is fixed per layer rather than being a control.
4. **Aftertouch → pitch and → LFO speed.** The panel routes both; only
   brilliance, level and vibrato *depth* are wired.
5. **Humanisation as specified:** pitch drift ±4 cents, velocity ±15%, timing
   ±20 ms. Timing jitter exists; per-note pitch drift does not, and "the tuning
   is all over the place" is the thing `Blade Runner 001` says twice is the
   instrument's whole character.
6. **The reverb is not long enough.** The sheet asks for 6–12 s with 40–80 ms
   pre-delay; the genre's room is set in `space` and is nowhere near that, and
   there is no pre-delay parameter at all.
7. **"Blade Runner Blues" as a variant** — lower cutoff, lower resonance, slower
   attack, longer release, more vibrato, more detune, more reverb, subtler
   aftertouch. That is a second parameter set for the same genre, which the
   architecture has no way to express today.
