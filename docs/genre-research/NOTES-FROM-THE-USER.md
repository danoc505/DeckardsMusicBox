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
