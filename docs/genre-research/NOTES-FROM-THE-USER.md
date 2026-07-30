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

---

## 6. What Hawtin actually used, and the TR-1000

### The machines

From several sources, kept separate from the technique claims below:

- **Drum machines: 707, 808, 909, and the 606.** "Spastik" is described as heavily
  processed jams across the 707, 808 and 909. The 606 matters more than its
  reputation suggests: "many drums came from the 606 — which had one mono out,
  and hi-hats were different little pots, so mixing happened that way."
  [corpus:insomniac, corpus:technomusicnews]
- **TB-303, and more than one.** Photos of the Plastikman live rig show a TR-909
  above **two** TB-303s, next to a TR-808. [corpus:gearnews]
- **Juno-106, SH-101, Sequential Pro-One / Six-Trak.** [corpus:gemtracks,
  corpus:equipboard]
- **Serge Modular** — he was an early adopter of the West Coast approach.
  [corpus:gearnews]
- **Effects, which several sources treat as the real instrument:** a BEL
  Electronics BD80 delay for most of the delay work, an Ensoniq DP4, later
  Roland reverbs and Eventides. Live and DJ, Lexicon PCM42/PCM84-class delays.
  [corpus:vintagesynth forum, corpus:gearnews]

**An honesty note that matters for this repo:** the forum sources say directly
that his processing chains are *not* publicly documented. So the *list* of boxes
is well attested and the *chains* are not. Anything in the tables about how the
effects are ordered or set is [EAR] or [GUESS], not [corpus].

### The one structural fact that changes the program

The 606's single mono out is described as the *reason* mixing happened a certain
way — and the 909's virtue, by contrast, is **individual outputs per voice**.
That is the technical basis for the user's instruction:

> "We need to effect each instrument on the drums. This is what we are missing —
> everything needs its own character that also at times is moving and swelling."

This is correct and the program cannot currently express it. Today every drum
lane in a machine shares one bus (`g.drumDrive`) into one gate send and one room.
There is no per-voice send, so there is no way to put a long delay on the rim and
a short gated room on the clap, and no way to move those independently. The
motion system is already capable of it — `rideBus` will ride any AudioParam — but
the graph has one bus where it needs one per voice.

**This is the single highest-value unbuilt item for this genre**, above the
TR-1000 itself: a drum machine with per-voice sends is what makes six repeated
elements sound like an evolving record, and it is exactly the "groove at all
levels" and "movement in each element" pair from `Min Tech 001`.

### The TR-1000

Roland's TR-1000 (announced late 2025) is their first drum machine in forty years
with a genuinely analogue engine. What is relevant here:

- **16 analogue voice circuits** rebuilt from the TR-808 and TR-909 designs with
  modern components — not emulation.
- **ACB modelling alongside it** for 808, 909, 707, 606 and CR-78, plus ~75
  "circuit-bent" ACB variants (marked X) giving far wider control of pitch,
  dynamics and character than the originals had.
- **Three engines: ACB, FM and PCM**, plus sampling with time-stretch, BPM sync
  and non-destructive slicing.
- **Per-sound processing: each engine has its own filter, amp, compressor and
  modulation**, on top of a dedicated delay and reverb, master FX and an analogue
  FX section.

[corpus:musictech, corpus:vintageking, corpus:djtechtools, corpus:perfectcircuit]

That last bullet is why the user named this box specifically. **A per-voice
filter/amp/compressor/modulation section is precisely the missing architecture
described above** — the TR-1000 is not a different set of samples, it is a drum
machine whose design assumption is that every voice has its own character and its
own movement. Modelling it means building the per-voice chain first; the sound
set is the easy half.

**Scope, honestly:** replacing `tr808` with a `tr1000` machine is not a table
edit. It needs (a) a per-voice chain in the graph — filter, drive, compressor,
send — for each of kick/snare/clap/rim/hat/openhat/toms, (b) those parameters
declared per voice on the panel, which multiplies the control count by roughly
seven, and (c) motion lanes per voice. The 808's existing voices can be the
starting sound set, since the TR-1000's analogue circuits *are* the 808 and 909
circuits rebuilt — so this is an architecture change wearing a new name, and the
name is the least of it.

---

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

---

## The TD-3-MO panel, and the Devil Fish manual

*From the photograph of a modded-out 303, and from Robin Whittle's own manual
for the Devil Fish mod set (firstpr.com.au/rwi/dfish). Read after shipping ten
knobs based on a photograph alone — which was not enough, and the manual said
so in several places.*

### What the manual corrected

| control | what shipped | what the manual says |
|---|---|---|
| **MUFFLER** | a lowpass across the output | *not a filter.* "Two types of muted clipping … softens the loudest extremes … **whilst allowing the bass to pass largely unaffected** … little or no effect when the signal level at the VCA output is low." A lowpass does the opposite of the phrase in bold — it takes the top off everything at every level. |
| **FILTER FM** | an independent oscillator driving the cutoff | *feedback.* "The output signal of the filter passes through the VCA (which includes the Muffler on its output) to the Filter FM pot, which feeds none, some or a lot of this signal back into" the filter. It is a loop around the whole voice, which is why it screams rather than merely brightening. |
| **FILTER TRACKING** | a ratio on the cutoff knob | additive, ~**2.7 kHz per octave** at maximum, zero point about C at the bottom of the normal octave. As a ratio, how much it tracked depended on where the cutoff happened to sit. |
| **ACCENT SWEEP** | a continuous 1–4 depth knob | a **three-position switch** that also doubles the resonance: on/normal-res, on/hi-res, off/hi-res. The depth it was setting is the ACCENT pot, which already existed. |
| **SOFT ATTACK** | 0–200 ms | **0.3–30 ms.** Seven times too wide; the top of the dial was a pad. |
| **NORMAL / ACCENT DECAY** | 50 ms–1.2 s / 40 ms–1.2 s | **16 ms–3 s** and **30 ms–3 s**, and they are *independent* — the accented one was being floored by the normal one, so a long accent decay could never be heard. |
| **SLIDE TIME** | 10–300 ms | **60–360 ms** (normal, to five times normal). Most of the old dial was below anything the instrument can do. |

### The one that matters most: the accent sweep has a MEMORY

> "The first accent causes a positive output, but when the resonance pot is
> fully clockwise, this sweeps upwards and **some charge remains in a capacitor
> (C13)** by the time the next accent occurs. Consequently the second and
> subsequent accent pulses cause a **higher output than the first**. This is one
> of the keys to the emotional nature of the TB-303 — you poke it and it squeals
> a little . . . you poke it again and it squeals even more."

The voice had no state between notes at all: every accent opened the filter by
exactly the same amount, so a bar of accents sat flat instead of winding up.
That is now modelled — charge accumulates on the graph and bleeds away between
notes — and the **SWEEP SPEED** switch is the manual's three time constants:

- **fast** — first accent strong, subsequent ones smaller
- **normal** — later accents *higher* than the first (the 303's own behaviour)
- **slow** — slower to rise, rises about twice as high, slower to cool

This is better than the automation lane it replaced, because it responds to
what the part is playing rather than to the clock.

### Still a departure, and named as one

- **OVERDRIVE** here is a waveshaper with makeup gain. On the instrument it is
  the *level of the oscillator into the filter*, "zero to 66.6 times normal" —
  and at zero the self-oscillating filter can be heard alone. Different
  topology; not yet changed.
- **The step editor** is not on the instrument at all. A real 303 is programmed
  through a one-octave keyboard in a mode nobody enjoyed.
- **TEMPO, PATTERN GROUP, MODE** are drawn as the machine draws them but they
  *report* rather than set — this program is the sequencer. They read the
  tempo, which section is playing, and whether the lane is composed or pinned.
- **The patch sockets** are drawn and inert. There is no outside to patch to.

---

## The apex arc

*"It's not building, which the apex build should do… We can start with one bass
note and fill in the silence with reverb, delay etc. and build up around that.
It's maximising the minimal."*

### What was wrong

A song's energy was a **step function**: every bar of a section carried that
section's one `energy` number, and the loudest thing in the record was whichever
chorus happened to be last — almost always the final bars. Nothing moved *within*
a section, and nothing expressed "the record goes somewhere".

### What it is now

FORM owns one value per **bar**, drawn from a genre table:

- a low **floor** at the open, rising to the apex on a curve with a **bend**, so
  the climb is slow first and steep near the top rather than a straight ramp
- the apex **about two thirds through** (0.61–0.71 measured across genres)
- one or two **lesser highs** before it, as raised-cosine bumps
- a **dip** immediately before the apex — an arrival lands from a height only if
  something falls first
- a **tail**: the record leaves rather than stops

Three things read it, each for a property it already owned:

1. **The one gain formula** — `sec.energy` became the bar's arc value. The old
   "+6% if this is the last chorus" bump is gone; the arc *is* the peak now.
2. **The note thinner** — the new part, and the answer to "how much can we strip
   away and then build up". Volume alone cannot do it: a quiet full pattern is
   still a full pattern. Every note draws a keep value and survives if it clears
   the bar's threshold, weighted by metric position so what is left at the floor
   is the *pulse*, not a random scatter. The genre says what fraction it is
   willing to lose — Plastikman 0.76 on the bass, lofi 0.30.
3. **A new motion kind, `apex`** — a lane that follows the song's shape instead
   of the clock, so the desk's high band and the 303's cutoff open *into the
   arrival* and pull back through the dip. That is the DJ move — "using high,
   mid and lows like a DJ does" — tied to the arrangement rather than to time.

### Measured, 40 seeds per genre

```
  genre        apex at   arc open/apex/end    ev/bar open -> apex   loudest bar
  lofi           0.64    0.50 / 1.00 / 0.55       25.8 -> 31.6         0.50
  synthwave      0.68    0.29 / 1.00 / 0.41       24.4 -> 40.8         0.64
  dkc            0.61    0.60 / 1.00 / 0.63       26.1 -> 35.9         0.50
  vangelis       0.71    0.23 / 1.00 / 0.27        7.1 ->  9.6         0.64
  acid           0.66    0.33 / 1.00 / 0.52       23.1 -> 31.9         0.61
  plastikman     0.69    0.13 / 1.00 / 0.38       10.7 -> 33.3         0.69
  jungle         0.65    0.37 / 1.00 / 0.46        9.6 -> 10.5         0.57
```

**Plastikman builds 3.1×** and its loudest bar now lands at 0.69 of the record —
on the apex, not at the end. Synthwave 1.7×, acid and dkc about 1.4×.

**Honest about the weak rows:** lofi and dkc still put their loudest bar at 0.50
rather than on the apex, and jungle and vangelis barely thin at all (9.6→10.5,
7.1→9.6). For vangelis and lofi that is partly deliberate — a beat tape sets a
mood and stays in it, and the score swells rather than builds — but it is not
*entirely* deliberate, and those three tables have not been earned by listening
yet. Jungle in particular should drop and rebuild more than these numbers show.

### A note on how this was checked

The bar-by-bar note grid (`harness/probe_arc.js`) showed seed 1's Plastikman
bass using **only steps 1, 2 and 5** in every bar of the song — which looked
exactly like a bug. Measured across 60 seeds: the distribution is flat (53.1% in
the first half, steps 0/4/8/12 correctly empty because `avoidKick` is on). Seed
1 had simply drawn a three-note cell that landed early. Suspicion is not
evidence in either direction.

---

## How knobs are used in arrangement — the research, and what it found missing

*Asked directly: "Did you do research on how knobs are used in arrangement? Do
you understand how to do that properly?" The honest answer at the time was no,
not properly. Here is the research and, more importantly, what measuring against
it exposed.*

### What the sources say

Three moves come up in every account of filter work in this music:

1. **The 8–16 bar sweep.** "Automate the filter cutoff over 8–16 bars for
   gradual build and release" — even a subtle 20% sweep over 8 bars keeps a loop
   moving without being obvious.
2. **The build into the drop, and the snap-back.** "During a build-up, apply a
   high pass filter to your entire synths/instruments group and over the course
   of 8 bars automate the cutoff to move from 20 Hz up to around 200–250 Hz,
   then have the cutoff **shoot back down to 20 Hz on the drop**." The reset is
   the move — the build is only felt because it ends instantly.
3. **Constant subtle movement.** "A very common technique in house and techno
   to make otherwise loop-based music feel as if it's evolving over time." And
   for breakdowns specifically: reverb send increases to open up space.

Hawtin's own account is the same idea by hand rather than by automation lane:
he does "most of the construction and arrangement live by moving faders and
muting or turning things on the machines — you can hear things coming in and
feel that **push and pull** of the faders or the knobs."

### Measured against that, three real gaps

Measured with `harness/probe_automation.js` (coverage) and a kind-census:

| what | before | after |
|---|---|---|
| genres riding the **desk** (the DJ high/mid/low) | **1 of 7** | 7 of 7 |
| genres riding the **echo** | **1 of 7** | 6 of 7 |
| `gesture` motions in the whole file | **5** | 15 |
| `gesture`s in Plastikman — the "push and pull" genre | **0** | 2 |
| parked controls (automatable, nothing rides them) | 0 | 0 |

The desk finding is the blunt one. Six of seven records had a three-band DJ
mixer and a delay across the master and **never touched either**. The one genre
that did was the one that had been complained about, which is not a coincidence
and is not a good way to find these.

**Point 3 was already well covered** — 309 ridden lanes, no parked controls,
LFOs everywhere. **Point 2 did not exist at all.** Every gesture in the file was
two bars long, which is a fill, not a build.

### And the new gesture was on the wrong side of the beat

`on:"peak"` places a gesture on the first N bars **of** the arrival. Used for a
build, it measured backwards — the low band was cut for eight bars *after* the
drop and filled in afterwards:

```
  bar  175     0.4 dB   ####################
  bar  176   -10.7 dB   ###########   <-- ARRIVAL
  ...
  bar  184     0.3 dB   ####################
```

A build that happens after the thing it builds to is not a build. `on:"build"`
is the new placement — the N bars *before* the arrival, ending on its downbeat,
so a gesture contributing nothing outside its window **is** the snap-back:

```
  bar  167     0.5 dB   ####################
  bar  168   -10.7 dB   ###########      <-- the cut lands
  bar  172    -7.9 dB   #############
  bar  175    -2.2 dB   ##################
  bar  176     0.4 dB   ####################   <-- ARRIVAL
```

`on:"peak"` is untouched — two genres use it deliberately for a gesture that
decays *out* of the arrival. The new side got a new name rather than a silent
redefinition.

### Deliberately still zero

Lofi, DKC and Vangelis have **no build gestures** and that is a decision, not an
omission: a beat tape, a loop-forever level theme and a film cue do not drop.
They ride the desk gently and arc instead.

### Not yet done

- **`plock` is rare** — 0–3 per genre. Per-step parameter locks are a signature
  of this music and are barely used.
- **LFO lengths are odd numbers** (22, 26, 27, 30, 34 bars). For free-running
  texture that is correct and deliberate; but nothing is *aligned* to 8/16/32
  except the gestures, so there is no "this move happens every 16 bars" pulse.
- **13 lanes move under 3% of their dial.** For a ±12-semitone tune knob 3% is
  70 cents and very audible, so the flat threshold is the wrong test — it is the
  same flat-threshold mistake this project has already documented twice. That
  probe should report travel in each control's own units.

---

## The rule of three, answered with a knob

*"This is how we can bring change into the rule of three with any kind of change
like this. But it also gives the song character and movement."*

That is the right reading of the architecture, and the research backs it
completely.

### What the sources say

- **"Techno's hypnotic quality comes from automation and modulation rather than
  constant arrangement changes, with filter sweeps, delay throws, and reverb
  sends replacing chord changes and new melodic ideas. This is how a four-bar
  loop stays interesting for eight minutes."** [attackmagazine, dub techno]
- **"Open a low-pass filter by a few percent each time the loop repeats, so over
  32 bars the sound brightens gradually."** [musicradar] — the change is keyed to
  the REPETITION, not to the clock.
- "The foundational pattern repeats, but small changes are introduced over time
  — a hi-hat removed every other bar, a filter that opens slightly … the
  repetition creates the groove while the variation sustains interest." [izotope]
- "Delay functions as a compositional tool that creates rhythm and melody from
  single notes or short phrases" — the **throw**, a send that spikes and is gone,
  not a wet level.
- And a warning worth keeping: "Once listeners begin to anticipate something
  strange might happen, there won't be anything left to surprise them."

### What was here, measured

Stage 2 emits a `vary` demand on the third statement of a function, and **only
the material could answer it** — by rewriting notes. For music whose changes are
meant to be timbral that is the wrong instrument entirely.

And the TR-1000 was in the same state as the desk before it: all 69 controls
ridden by *someone*, so nothing was parked, but

| genre | TR-1000 lanes | of which per-voice chain knobs (of 60) |
|---|---|---|
| synthwave | 70 | 60 |
| plastikman | 14 | 8 |
| acid | 12 | 7 |
| lofi | 2 | **0** |
| dkc | 1 | **0** |
| jungle | 0 | **0** |

Three genres drew a ten-voice drum machine and never moved one of its per-voice
knobs.

### Two new motion kinds

- **`occurrence`** — a step per statement of the section's function, capped.
  The second verse is one step along, the third is two. This is the rule of
  three answered with timbre.
- **`throw`** — a send that jumps at the end of every Nth bar and decays into the
  next phrase.

### Measured after: the third statement, against the first

The first version of this measurement said every genre already varied — and it
was wrong. Its biggest movers were `mellotron.wow`, `reese.detune`,
`tb303.softAtk`: all **free-running LFOs**, which sit at a different phase two
minutes later whether or not anyone intended it. **Drift is not variation.** It
is not keyed to the hearing and a listener cannot connect it to "this is the
third time". So the probe now separates the two, and only the designed column
is claimed:

```
  genre        fn            DESIGNED (keyed to the hearing)   drift
  lofi         verse           4.0 lanes  tr1000.sVerb 18%      112
  synthwave    verse           1.0 lanes  tr1000.sVerb 13%       63
  dkc          verse           2.0 lanes  tr1000.sVerb 14%       55
  vangelis     verse           2.0 lanes  echo.send 15%          13
  acid         verse           2.0 lanes  tr1000.oVerb 20%       12
  plastikman   verse           2.9 lanes  tr1000.cVerb 22%       26
  jungle       verse           3.0 lanes  tr1000.dVerb 20%       23
```

### And the reason none of it worked at first: DUPLICATE KEYS

A duplicate key in an object literal does not merge, it **replaces**. Four were
found, and the new work had been silently deleted before it ever ran:

- `lofi.tr1000` and `dkc.tr1000` — two machine blocks each; the second erased the
  chain automation just added to the first
- `acid.tr1000.oVerb`, `plastikman.tr1000.hCut`, `plastikman.tr1000.oEcho` —
  the same defect one level down
- **`lofi.rhodes.tone`** — pre-existing and not mine. The Rhodes' section-by-
  section tone shaping had been dead for an unknown length of time, while the
  source read as though it ran.

There is now a seam check for both levels. Its first version was too weak — a
running brace counter that lost its place — and reported zero while four
duplicates sat in the file; the current one matches braces properly. It then
immediately caught me creating a *fifth* duplicate while fixing the others,
which is the best possible evidence that it works.

### Still not done

- **`plock` remains rare** (0–3 a genre) on music whose signature is the
  per-step lock.
- **Vangelis has no TR-1000 lanes** — correct, it barely has a kit; its
  per-hearing change lives on the echo and the CS-80's vibrato instead.
- The sizes of every step above are **mine, not measured**. The shapes are
  researched; the amounts are taste until they are heard.

---

## A battery run, with the notes actually read

*"Do more research and run a battery of tests on everything and make sure you
are printing out notes."*

Reading the rolls for all seven genres — rather than only measuring — is what
found three of the four things below.

### 1. The 303 has three time states and this had two

From the TENOR 2019 paper on acid-pattern notation: to program a TB-303 you
supply "the pitch data … pitch modification such as slide, accent, transpose
down and up. **The time data uses symbols and notation for note, tie and rest**."

Measured, 40 seeds: **acid's ties ran at 0.0%** — every note exactly one step
long, on the genre named after the instrument. The roll made it obvious once
printed: `11441...11..1.4.`, sixteen identical lengths.

`tieChance` now exists. Acid 0.0% → **11.0%**, Plastikman 0.0% → **32.4%** (more,
not less: with three to six notes in a bar the question is how *long* they are).
The same bar now reads `11421---41--1.4.`

Blast radius: acid 300/300 seeds and plastikman 289/300 moved; the other five
genres byte-identical, which is right — they use different bass builders.

### 2. A sub below hearing

The drone builder guarded its octave-down with `low >= R.bass[0] - 12` — a full
octave *under* the register the genre declared. Measured lowest bass note over
30 seeds:

```
  jungle     C0   16.4 Hz
  vangelis   A0   27.5 Hz
```

16.4 Hz is not a low note. There is no pitch to hear below ~20 Hz, no monitor or
headphone reproduces it, and the energy is spent on woofer excursion and on
headroom the rest of the mix then works under. **A sub you cannot hear still
costs you.** Floored at MIDI 24 (C1, 32.7 Hz — the bottom of a five-string bass),
with a seam check. Both genres now bottom out at 32.7 Hz.

### 3. Five probes that measure a program that no longer exists

`probe_nct`, `probe_voiceleading`, `probe_hierarchy`, `probe_bass_consonance`
and `probe_peak_arc` all crash. They are **MK1 probes**: they require `HARD`,
`SOFT`, `conduct` and `improvise`, none of which exist in this engine.

Two things were wrong underneath them and both are fixed:

- `build_engine.py`'s DOM stub returned a proxy for *every* property, so the
  moment the UI grew a real fader — `(+inp.value).toFixed(2)` — the whole bundle
  died with "Cannot convert object to primitive value". The stub now answers
  with primitives where the engine reads primitives.
- Its export list named MK1 symbols as bare identifiers, so the bundle threw
  `ReferenceError: T is not defined` at load. Every name is now optional.

The bundle loads again. The five probes still cannot run, because the laws they
measure are addressed to a different architecture — so `harness/probe_theory.js`
asks those laws of MK2 directly, by reading the notes:

```
  genre        out of key   NCT unresolved   chord<bass   lead<chord   unisons
  lofi              0.0%          33.0%        0.0%        5.5%     10.9%
  synthwave         0.0%          33.8%        0.0%        0.0%      1.5%
  dkc               0.0%          34.6%        0.0%        0.0%      3.8%
  vangelis          0.0%          36.8%        0.0%        0.0%      0.8%
```

- **In key: 0.0% violations everywhere.** That law holds.
- **Chords above the bass: 0.0%.** In absolute register, which is the trap.
- **Non-chord tones: a third of them leap away instead of resolving by step.**
  This was the dead HARD law the MK1 review found, and **it is still not
  enforced here.** For this repertoire the classical resolution rule may not be
  the right law — but that should be a decision on the record, not an accident.
  It is not fixed; it is now measured.
- **Lofi: 5.5% of frames have the lead below the top of the chord**, and **10.9%
  have two parts on the same pitch** — a part disappearing rather than a chord.

### 4. A finding I got wrong by reading, and measurement corrected

Synthwave's roll printed the lead and counter rows **byte-identical**. That looks
like a copied part. Measured across 30 seeds: **0.0% of counter notes share a
pitch with a lead note** — in any genre. The roll prints scale degrees, and the
two lines were using the same degrees in different octaves. Not a defect.

But the same measurement found a real one: **100% of counter notes land on the
same step as a lead note, in all seven genres.** The pitches are independent; the
*rhythm* never is. A countermelody that only moves when the tune moves is a
harmony part wearing a different name. The seam check called "the counter is a
line not a harmoniser" tests pitch, not rhythm. Not fixed — named.

---

## Counter melody, the Berlin School sequencer, and the chip's own limit

### 1. The counter had no rhythm of its own

`deriveCounter` walked the *lead's* notes and emitted one at each — structurally
incapable of an independent rhythm. Measured: **100% of counter notes on the same
step as a lead note, in every genre.**

For `style: "double"` that is correct and untouched — synthwave's counter *is*
the octave double, and a double that arrives late is a mistake. For `style:
"line"` it is wrong, so a line-style counter now takes the gap after the note it
was derived from. Preferring silence but not requiring it: a first attempt
demanded a real rest and moved only 5.6% of acid's notes, because a dense tune
leaves no silence — and a second voice entering a step behind the first is
**imitation**, the oldest counterpoint there is.

```
              same step as the lead
              before    after
  lofi         100%      65%
  dkc          100%      63%
  vangelis     100%      35%
  plastikman   100%      30%
  synthwave    100%     100%   (double — correct)
```

### …and it exposed something worse

**Four genres composed a counter-line the arrangement never played.** `dkc`,
`acid`, `plastikman` and `jungle` each declared a full counter table — density,
interval pool — and `counter` appeared in no section's active list. Eleven notes
a song built and discarded.

**Reading the roll cannot catch this.** The roll prints MATERIAL, so the counter
row sits right there on the page looking like music. I had read those rows.

Each genre now says what it means: DKC activates it (Rare's scores are built on
second lines); acid, plastikman and jungle declare `counter: null`, because two
pitched parts was never a shortfall — it is the genre. There is a seam check so
the silent third state cannot come back.

### 2. The sequencer, and why it is not an arpeggiator

**An arpeggiator spells the chord you are holding. A sequencer plays a figure and
is transposed by the harmony.** They compose differently and Berlin School is the
second one — Phaedra was the first commercial album built on a sequencer, and
Chris Franke's contribution was turning the Moog modular's CV step sequencer into
a live instrument.

Three switches on the existing ostinato builder, all defaulting off so DKC's
fixed cell over a moving pedal is untouched:

- **`run`** — the cell index does not reset each bar. *"Two individual sequencer
  parts play at odd lengths, usually one or two steps apart … each time playing
  different combinations of notes until they line up again."* Vangelis's cells
  are **11, 13 and 7 notes against a 16-step bar**, so the 11 takes eleven bars
  to return to its own downbeat.
- **`follow`** — degrees read against the current chord. The MIDIbox Berlin
  School tutorial's top track is a **transposer** on whole notes with the fast
  tracks set to Transpose + Force-to-Scale; our chord progression is that
  transposer.
- **`ratchet`** — repeat a note on a step. Clamped to what the grid can hold: an
  eighth-note step ratchets into two sixteenths and no further, because a triplet
  ratchet needs a finer grid than this program has. The grid law caught that on
  18 blended pairs and was right to.

Vangelis, seed 1 — **every bar different**, from a 7-note cell:
```
ostinato 1-5-3-1-5-3-1-5- | 1-3-5-1-5-3-1-5- | 7-5-2-5-7-2-5-2- | 7-5-2-7-5-2-5-7-
```

Synthwave gets the other instrument — an **arp**: follows the chord, restarts
every bar, locked to the grid the way a Juno's arpeggiator locks to its clock.
The classic arp synths are the **Juno-6 and Juno-60**; the Juno-106 everyone
associates with this music actually *lost* the arpeggiator.
```
ostinato 1351135113511351 | 6136613661366136 | 7247724772477247
```

### 3. The chip has six voices and we were asking for eight

The YM2612 has six 4-operator FM channels, and *"the sixth channel may be used
for direct DAC sample playback … a game can trade that FM voice for drums,
speech or other digitised sounds. **It does not gain a seventh channel.**"* Plus
three PSG squares and one noise.

Measured, DKC on the sega rig: **peak 8 simultaneous FM voices**, 7 on another
seed. With a drum playing the real budget is five.

This is the best constraint in the program because it isn't taste — it's the
machine, it's documented, and it forces the decision real Mega Drive composers
made daily: when everything wants to sound, something does not play.

Refusing new FM notes while a sample sounds got the peak from 8 to 6 and left one
seed at 7 — because **the DAC steals channel 6, it does not queue for it**. Drums
on a Mega Drive do not wait their turn. So the lowest-priority FM voice still
sounding is cut short at the moment the sample starts, which is a real note
ending early and is why chip arrangements leave holes under the drums.

```
  peak FM+DAC over 20 seeds:  8  ->  6/6      within the chip
  peak PSG:                          2/3
```

Priority — bass, lead, keys, ostinato, counter — is a stated opinion, not a
measurement. A chip tune with no bottom is a ringtone.

### Blast radius

```
  lofi        300/300 seeds   1951 -> 1951 events   (counter displaced, none added)
  synthwave   300/300         2844 -> 4040          (the arp)
  vangelis    300/300          659 -> 1195          (the sequencer)
  dkc         300/300         2609 -> 2545          (counter activated, chip budget enforced)
  acid          0/300         unchanged             (counter nulled, no ostinato change)
  plastikman    0/300         unchanged
  jungle        0/300         unchanged
```

---

## The cymbal, and the fader that did nothing

*"There is a cymbal that is horrible. It's harsh and sounds bad. I tried to bring
the slider down on all the cymbals, nothing happened."*

Both true. They were separate faults.

### The fader — and it was every bus control, not just the cymbals

A **gesture** control is read by `P()` at the moment each note sounds, so turning
one mid-song is heard on the next note. A **bus** control is not: `rideBus`
writes its entire automation curve onto the AudioParam once, when the graph is
configured at playback start. After that the curve owns the parameter and a hand
on the fader writes a `TRIM` that nothing ever reads again.

So **every mix fader, every send, every per-voice filter and the whole desk were
frozen the moment playback started.** The panel moved, the number changed, the
sound did not — the exact defect this project has a standing rule about, sitting
inside the one control a hand reaches for first.

Fixed by rewriting the curve from the current moment when a bus control is
touched, anchored to the same song zero so a mid-song move doesn't also throw
the automation back to bar one. Throttled at 60 ms, because a fader drag fires
on every pointer move. Verified: a fader move triggers the rewrite, a gesture
knob correctly does not.

**And my first measurement of this was wrong** — the fifth time this session. It
rendered with no `space` argument, so `setSpace` never ran, no chain was ever
configured, and it reported all ten faders dead. They were not: in a properly
configured render the fader moves its drum by **176 dB**. The bug was never in
`rideBus`; it was that nothing called it again.

### The cymbal

Measured dry, against the hats that nobody has complained about:

```
        mid%   2-6kHz   tail     the harsh band, absolute
crash   19.6    18.7%   1.54 s   0.0231
hat     14.4    14.1%   0.13 s   0.0032
```

The spectrum was not the problem — a cymbal *is* mostly high. **The tail was.**
Six square waves through a highpass, all on one shared envelope, so the thing
was exactly as bright at 1.4 seconds as at 40 milliseconds. Nothing physical
does that: a struck cymbal's high modes are the most heavily damped, so it
**darkens** as it rings. The clang is short; what sustains is a wash that keeps
losing top. Six undamped squares holding their brightness for a second and a
half is a buzzer.

Three changes, each one a thing the object actually does:

1. **The clang is short** — the tonal partials get their own envelope at ~26% of
   the total, so the metal rings and stops while the wash carries on.
2. **It darkens** — a lowpass across the whole voice sweeps 14 kHz → 3.5 kHz over
   the decay. This is the one that removes the harshness: the ear reads
   sustained *unchanging* top end as harsh long before it reads it as loud.
3. **Less metal, more air** — the square stack drops 0.62 → 0.34 and the noise
   comes up, because a crash is far closer to filtered noise than to a chord.

```
              harsh RMS (2-6 kHz)   HARSH%   tail    peak
  before            0.0231           18.7%   1.54 s  0.626
  after             0.0129           16.4%   1.23 s  0.474
```

**44% less energy in the harsh band**, a shorter tail and 2.4 dB off the peak.

### A measurement note worth keeping

The probe's first band split was low / 140 Hz–2 kHz / everything above. Cymbal
harshness is specifically **2–6 kHz**, and lumping 2–20 kHz into one bucket
cannot see it — worse, when the mid dropped the "high" *percentage rose*, which
reads as brighter when the absolute energy had fallen. There are four bands now
and the harsh one is reported in absolute terms as well as as a share, so a drop
in proportion cannot disguise a rise in level.

Also: the tone rows render **dry**. With the genre's reverb on, every tail in the
table lengthened — kick 0.25 s → 2.25 s — and I nearly read a room as a change to
the crash.

**The ears are still the judge.** The numbers say the thing that made it harsh is
44% smaller and no longer sustains. Whether it now sounds like a cymbal you want
is not something this probe can tell either of us.

---

## The knob sweep, and the five voices that ignored their own channel

Five separate "this knob does not reach the sound" bugs turned up in one
session, and every single one was found by **you hearing it** — never by
anything in the harness. That is a class of defect, not five accidents, so it
got a sweep of its own rather than a sixth investigation.

`harness/probe_controls.js` puts each machine in its slot, strikes every lane it
owns with one long accented note and one short plain one, renders with the
genre's real space, kick, drive, gate and motion plan, and compares peak, level,
brightness and tail with each control at the bottom and then the top of its
travel.

It took **nine tries** to become trustworthy, and the failure was the same every
time: *the probe was measuring its own setup rather than the program.*

1. It never PICKed the machine under test, so it read whatever the genre drew.
2. It set `MK2.PICK` but never handed it to `composeSong` — the picks are an
   argument, not a global.
3. It rendered only the first lane, and then called the snare and hat controls
   dead because the note was a kick.
4. It skipped the TR-1000 entirely, because that machine declares `kits` where
   the others declare `lanes` — the only drum machine anybody plays.
5. It struck one short unaccented note, which cannot see an accent knob or a
   tape end.
6. It set `PARAMS` where `bus` and `gate` read `TRIM`.
7. It gave keys notes no `wow` field, and the Rhodes scales its wow **by** the
   chart's drawn depth — so the knob multiplied zero and read as dead.
8. It took peak, level, brightness and tail across the **whole** 55-second,
   twelve-lane file. Moving the rimshot's filter end to end changes two hits out
   of twenty-four, which is under a tenth of a decibel of global level. Nine
   controls came back "dead" and every one belonged to a quiet drum — the
   signature of a blunt metric, not a broken circuit. It now cuts the file into
   one window per lane and asks each on its own.

### What it found once it was honest

**BUS and GATE on all five drum machines had never been connected to the hand.**
`setSpace` passed the genre's argument straight to `rideBus`, so
`panelValue(machine, "bus")` and `panelValue(machine, "gate")` were never read.
That is also the answer to the mystery from the day before — driving
`tr1000.gate` from 0 to 0.9 changed nothing, on that build and every build
before it. Nothing read it.

**Ten channel-strip knobs on the TR-1000 were wired to nothing.** `sTune`,
`sDecay`, `tTune`, `tDecay`, `mTune`, `mDecay`, `rTune`, `rDecay`, `cTune`,
`cDecay` — the snare's, both toms', the rimshot's and the clap's. The kick's,
both hats', the crash's and the ride's all worked.

The snare is the one worth remembering. `V.s808` called `chTune()` and
`chDecay()` on its second line, put both into locals, and **then never mentioned
either again**. Grep for "does this voice read its channel?" and the answer is
yes. Listen, and the answer is no. The other four never asked at all.

---

## A dissonance has to step

Measured over 20 seeds a genre, of the lead and counter notes that are **not in
the chord under them**, the share that then leapt away instead of resolving by
step:

```
  lofi 34.9%   synthwave 33.0%   dkc 38.1%   vangelis 44.8%   acid 50.0%
```

That is the oldest rule in common-practice writing, one of this project's own
documented HARD laws, and **nothing enforced it**. MK1 had a
`HARD.resolvesByStep` and never called it once.

A note outside the chord is a passing tone, a neighbour or an appoggiatura, and
all three are defined by what happens next: they move by step. Leap away from
one and it stops being an inflection and becomes a wrong note.

The fix is a **constraint, not a correcting pass**. Nothing is moved after the
fact; when the note just written is outside the chord, the *next note's choices*
are narrowed to the ones that answer it. In a seven-note scale every diatonic
non-chord tone has a chord tone one step away in some direction, so a resolution
always exists; only an occupied seat can block it, and then the note is not
played and the dissonance waits for the next onset. The direction preferred is
the one it arrived by — a passing tone — and the reverse is allowed, which is a
neighbour.

Three things carry it:

- **the tune** narrows its move to a single scale step;
- **the counter** narrows its candidate list, and if nothing in it answers by
  step, *the counter does not play*. Measured both ways: taking the closest
  anyway left 29.3% unresolved over 5437 notes; declining to play left 20.4%
  over 5083. A third of the defect for 6.5% fewer notes;
- **the question phrase now lands on a chord tone too.** It used to end wherever
  its last move left it, and the answering phrase starts on a fresh pitch and
  cannot know what was left hanging — so a dissonance at the end of bar 1 was
  always leapt away from at the top of bar 2, the most exposed junction in the
  four bars. An antecedent landing on a stable tone is not a weaker question;
  that is what a half cadence is.

### The measurement was wrong too, and in my favour

Vangelis got *worse* while everything else improved, so I looked instead of
shipping the number. **205 of its 254 "unresolved" lead notes — 81% — were
followed by a rest**, some of them bars long. A note that has died away does not
need answering. The probe was counting phrase endings.

There are two columns now, because they say different true things: how often a
dissonance **still sounding** leaps, and how often a phrase **ends** on one.

Read the corrected way, the constraint on versus off:

```
                 off      on
  lofi         31.5%    14.0%
  synthwave    28.6%    13.3%
  dkc          32.8%     7.7%
  vangelis     34.2%    16.1%
  acid         50.0%     0.0%
  TOTAL        30.8%    12.7%
```

The price is about 5% fewer lead and counter notes. **Not zero, and it should
not be** — an escape tone and a free appoggiatura are real writing, and a line
with no dissonance left in it is a line with nothing in it. Whether it sounds
better is still your call, not the probe's.

### ...and the ANALOG FILTER was not in the circuit at all

The last knob on the machine that still moved nothing. `g.kitFilter` was built,
given a cutoff, ridden by `rideBus` on every song and automated by the
Plastikman table with a 40-bar triangle LFO sweeping 1.2–4.2 kHz — and
**connected to nothing**. Every channel went `mk → g.bus.drums` direct, straight
past it. The comment four hundred lines above it says "the whole kit through
kitFilter on its way to the drum bus". The wire disagreed, and the wire is what
you hear.

At its default of 20 kHz the filter now in circuit is a wire: peak 0.6199 →
0.6172, RMS identical to five figures. Turned down, it is the knob it always
claimed to be.

The TR-1000 sweep now reads: **1 control moves the sound in no way at all**, and
it is `kit` — a switch that chooses between four voice sets, which a one-note
test with a fixed voice cannot see by construction.
