# THE BARBERPOLE PHASER — the illusion, the sources, and what we built

*2026-08-03, written alongside the build at `2026-08-03o`. The user asked
for a barberpole phaser with an interesting retro-futurist UI, and: "make
sure you do your research." This is the reference copy of what the searches
gave, so the next person does not re-search it.*

**What it is in one sentence**: a phaser whose notches climb (or fall)
through the spectrum FOREVER, arriving nowhere — the Shepard-Risset endless
glissando done with holes in the spectrum instead of tones.

---

## 1. WHERE IT COMES FROM — Harald Bode, 1981

Bode is the frequency-shifter man (his shifter is on Wendy Carlos records
and Kraftwerk's pop sounds), and he showed a modular synthesiser in the
early 1960s, before Moog or Buchla had one assembled.

**He created the barberpole effect using comb-filter peaks in 1981, and the
Barberpole Phaser turned out to be his LAST COMPLETED INSTRUMENT.** It is
based on "the Shepard scale and the Shepard-Risset glissando" and applies
"an everlasting glissando upwards or downwards, as long as the tone is
played" [perfectcircuit.com/signal/harald-bode; synthtopia 2023-05-02].

SYNTH-WERK, with the Center for Art and Media Karlsruhe (ZKM) and the
University of Music in Karlsruhe, is reconstructing it from the Harald Bode
archive as the SW 8101 — described as "the extremely rare Barberpole
Phaser", the first device out of that archive [synthtopia; noisebug].

**Why this matters for us**: the panel's maker line reads `BODE`. That is
not decoration — it is the attribution, and it is correct.

## 2. THE METHOD WE USED — DAFx-15, method 1

**Source**: Fabián Esqueda, Vesa Välimäki, Julian Parker (Aalto University /
Native Instruments), *"Barberpole Phasing and Flanging Illusions"*, DAFx-15
(18th International Conference on Digital Audio Effects).

The paper gives **three** ways to do it:

1. **Shepard-Risset cascade** — "a series of several cascaded notch filters
   moving in frequency ONE OCTAVE APART from each other". Each notch is "an
   additional element in the network that shapes the spectrum"; its gain is
   "controlled by a **raised-cosine envelope**, and time-varying for every
   sample".
2. **Synchronised dual flanger** — two cascaded time-varying comb filters
   with cross-fading, one sawtooth LFO modulating the delayed signal's gain
   and another modulating the delay length; a second flanger runs at a π/2
   phase relationship to smooth the transition.
3. **Single-sideband modulation** (frequency shifting) — a signal summed
   with a frequency-shifted copy of itself, needing "a chain of first-order
   all-pass filters acting as a spectral delay" to place the notches an
   octave apart.

The paper's own summary of when it works: the techniques reproduce the
illusion "particularly at **slow modulation speeds** and for input signals
with a **rich frequency spectrum**".

**WE BUILT METHOD 1, and the reason is arithmetic, not taste.** Method 3
needs a Hilbert transform and method 2 needs a designed dispersive allpass
chain. Method 1 is EXACT in WebAudio because a `BiquadFilter`'s `detune`
parameter is in **cents**: drive every notch's detune from one sawtooth
running 0 → 1200 and they all sweep up exactly one octave, exponentially,
and at the wrap each notch lands precisely where its neighbour started.
The illusion is seamless by construction rather than by tuning.

## 3. THE ENVELOPE IS HALF THE ILLUSION

This is the part that is easy to skip and impossible to skip.

Shepard tones "consist of several sinusoidal components spaced by octave
intervals, with component amplitude determined by a **fixed bell-shaped
spectral envelope over the LOGARITHMIC frequency axis**". As a component
approaches the upper edge of the bell it fades to silence while a new one
enters at the lower edge and fades in, "ensuring there is never a
discernible start or end point" [frontiersin / PMC; soundtrap; miniDSP
Shepard tone generator].

For a phaser the moving thing is a NOTCH rather than a tone, so the bell
rides the notch's **depth**: no depth at the bottom of the range, deepest in
the middle, none again at the top. Without it, the bottom notch audibly
jumps an octave once per cycle and the whole illusion collapses into a
sweep with a click in it.

DAFx-15 calls its version a raised cosine. Ours is a sine lifted to 0..1,
which is the same curve — a raised cosine IS a shifted sine — built that way
because an `AudioParam` SUMS its inputs, so a `ConstantSource` supplies the
lift and the oscillator supplies the swing.

## 4. HOW MANY NOTCHES, AND HOW OTHERS BUILD IT

- **Minimum for the illusion**: "you need a minimum of four phasers (or
  filters for continuously rising filtering, or oscillators for a
  continuously rising tone) **plus 4 VCAs**" [modwiggler]. The VCAs are the
  envelope — the same point as §3, from a builder rather than a paper.
- **Sinevibes Whirl** (2018) offers "4, 5, 6, 7 or 8 stages" with "three
  sound layers, coupled with **six modulation oscillators**", a
  "through-zero frequency modulation design for smooth transition between
  upwards and downwards sweeps", optional negative feedback "for a more
  unusual, artificial character", and "variable modulation phase offset for
  stereo widening or full spectrum inversion between the channels"
  [synthtopia 2018-05-29].
- **Doepfer A-191** is a Shepard-tone generator with 8 sawtooth and triangle
  outputs — the same illusion in the oscillator domain, and the reason a
  eurorack build of this is a known pattern rather than a novelty.
- The sound is commonly described as "**jet engine**" — an infinite riser —
  and Whirl's copy calls it "dramatic, wide-range spectrum swirls" with
  "distinct resonant peaks".

**We built SIX notches** at 110 Hz × 2ⁿ (110 Hz → 3.5 kHz), which is above
the stated minimum of four and inside Whirl's 4–8 range.

## 5. WHAT WE BUILT, MEASURED AGAINST THE SOURCES

| the source says | we did |
|---|---|
| notches exactly one octave apart | 6 notches at `110 * 2^i`; one sawtooth into every `detune`, ±600 cents = one octave |
| gain/depth under a raised-cosine envelope | each notch's **Q** is driven by a sine + `ConstantSource` lift, phase-offset per notch by `(i/N)/rate` seconds |
| slow modulation speeds | CLIMB defaults to **0.09 Hz**, range 0.01–1.2 Hz |
| rich input spectrum | fed from the matrix, so the sources are declared per genre (`space.barberFeeds`) |
| direction up or down | DIR is a **switch**, not a dial — a pole that changes direction mid-sweep is two effects |
| through-zero for direction changes (Whirl) | NOT built. Direction is per song, so no change ever happens mid-sweep and there is nothing to smooth |
| stereo phase offset between channels (Whirl) | NOT built — the phase offsets we have are between NOTCHES, not between channels |
| negative feedback option (Whirl) | NOT built. A feedback path around the cascade closes a cycle, and this program has measured what a cycle costs the renderer's repeatability |

**What no source gave**: notch Q values, envelope width relative to the
sweep, and wet/dry ratio. Those are `[EAR]` — chosen, not sourced, and they
are the first things to change if it sounds wrong.

## 6. WHY IT EARNS A SLOT HERE

The paper's own condition — "slow modulation speeds and input signals with
a rich frequency spectrum" — describes two of this program's genres exactly:

- **synthwave** (`barberFeeds: ["lead", "keys"]`): the endless riser is the
  genre's own cliché, done properly instead of as a pitched sweep.
- **plastikman** (`barberFeeds: ["keys"]`): minimal techno is a long static
  wash where the only thing that may move is timbre. A notch that climbs
  forever and never arrives is *movement that is not an event* — which is
  what `plastikman-minimal.md` says the whole record is made of.

---

## SOURCES

- [DAFx-15 Barberpole Effects, Aalto](http://research.spa.aalto.fi/publications/papers/dafx15-barberpole/)
- [Esqueda, Välimäki & Parker, "Barberpole Phasing and Flanging Illusions" (PDF)](https://www.ntnu.edu/documents/1001201110/1266017954/DAFx-15_submission_67.pdf)
- [MUMT 501 report on the paper — Néstor Nápoles López](https://napulen.github.io/reports/mcgill/mumt501/)
- [Inventing Electronic Music: Harald Bode — Perfect Circuit](https://www.perfectcircuit.com/signal/harald-bode)
- [Synth-Werk Recreating Harald Bode Barberpole Phaser — Synthtopia](https://www.synthtopia.com/content/2023/05/02/synth-werk-recreating-harald-bode-barberpole-phaser/)
- [Synth-Werk SW 8101 Bode Barberpole Phaser — Noisebug](https://www.noisebug.net/products/synth-werk-sw-8101-bode-barberpole-phaser)
- [Sinevibes Whirl — Synthtopia](https://www.synthtopia.com/content/2018/05/29/sinevibes-whirl-creates-barber-pole-infinite-phaser-effects/)
- [barberpole / always rising phasers — MOD WIGGLER](https://www.modwiggler.com/forum/viewtopic.php?t=161842)
- [Pitch Class and Envelope Effects in the Tritone Paradox — Frontiers/PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6173142/)
- [Shepard Tone Generator — miniDSP](https://wooters.github.io/miniDSP/shepard-tone.html)
- [What's Shepard Tone And How Does It Work? — Soundtrap](https://blog.soundtrap.com/whats-shepard-tone-and-how-does-it-work/)
