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
