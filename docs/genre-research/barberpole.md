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
| gain/depth under a raised-cosine envelope | **CORRECTED 2026-08-05, see §7.** Each notch is a `peaking` filter whose **gain in dB** is driven by a WaveShaper reading the raised cosine off the sweep itself. What is written here originally — a bell in *time* riding each notch's **Q** — was wrong in three separate ways and left the unit permanently silent |
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

## 7. THE WINDOW WAS WRONG, IN THREE WAYS AT ONCE

*Researched fresh and rebuilt 2026-08-05, build `2026-08-05a`. §3 above had
the sources right and §5 had the build wrong, which is the worst pairing —
a table saying "the source says X / we did X" where the second column
described something else.*

### 7.1 What the sources actually say the envelope is a function of

Re-read, and this time the operative words underlined:

> The cascade's **cut-off gains** respond to an inverted raised cosine
> envelope **across the frequency spectrum**, to preserve the equivalence to
> the Shepard tone spectral structure.
> — Esqueda, Välimäki & Parker, DAFx-15 (as summarised at
> research.spa.aalto.fi and in Nápoles López's MUMT 501 report)

> Shepard tones consist of several sinusoidal components spaced by octave
> intervals, with component amplitude determined by a **fixed** bell-shaped
> spectral envelope **over the logarithmic frequency axis**.
> — Frontiers/PMC; miniDSP

Two things, and we had both backwards:

1. **The envelope is a function of WHERE THE NOTCH IS, not of the clock.**
   The bell does not move. The notches move *through* it.
2. **It rides the notch's cut GAIN, not its Q.** A notch's Q is its *width*.
   The paper's own noun is "cut-off gain".

### 7.2 Why only the frequency-indexed window hides the wrap — the arithmetic

Write each notch's position in octaves above the bottom of the swept range as
`p = i + s`: `i` is which notch, `s` is how far through its cycle the sweep
has climbed. Just before the saw wraps the six notches sit at `p = 1..6`;
just after, at `p = 0..5`. **Five of those six positions are occupied on both
sides of the wrap**, by different notches. So if a notch's depth depends only
on `p`, five sixths of the response is *identical* across the wrap, and the
entire difference is that one notch leaves `p = 6` and another arrives at
`p = 0`. Put the envelope's zeros there —

    W(p) = 0.5 − 0.5·cos(2π·p/N)

— and the wrap is not merely inaudible, it is **not a change**.

A bell in *time*, one cycle per notch offset by `i/N`, does not have that
property. Notch 0's window phase at the wrap is `W(0) = 0.5`: it jumps a full
octave at **half depth**, in plain hearing, once every eleven seconds at the
default CLIMB. That is precisely the click §3 says the window exists to
remove.

**The panel had it right the whole time.** `barberEl` has placed its stripes
with `0.5 − 0.5·cos(2π·(i + phase)/6)` since the day it was drawn. The
picture was the correct spec and the filters were running something else.

### 7.3 And Q reaching zero is not "no notch", it is silence

WebAudio's `notch` filter has **no depth parameter at all** — it is always a
full null; only its width is adjustable. So the build used Q as a proxy for
depth, which is the substitution that killed it.

Chrome's `Biquad::SetNotchParams` does `q = max(0, q)` and, at `q == 0`,
installs **all-zero coefficients**: the filter outputs identically zero. A
notch whose Q merely *touches* zero mutes the whole cascade downstream of it.

Measured on a hand-built copy of the cascade (white noise, 18.8 s after all
six lines had filled):

| Q legs | exact-zero samples | runs | longest |
|---|---|---|---|
| 3 / 6 — as `buildGraph` constructed it | 0.009 % | 2 | 0.84 ms |
| 3 / 6.6 — 10 % headroom | 0.000 % | 0 | — |
| 3 / 3 — **as `setSpace` re-rode it** | **100 %** | — | — |

`setSpace` rode the sine leg and the DC-lift leg with the *same* number
(`5 × depth` into both), destroying the 6:3 ratio `buildGraph` had built, so
Q swung symmetrically about zero. Six notches phase-offset by a sixth of a
cycle each sit at Q ≤ 0 for the third of a cycle where `sin < −0.5`, and six
dead windows a third of a cycle wide spaced a sixth apart **tile the cycle
with no gap**. From the first notch's first trough at `(7/12)/rate` — 6.5 s
at the default CLIMB — at least one notch was always muting, on every seed,
for the rest of the song.

A third cause sat underneath both: `rideBus` clamps every value it writes to
`CONTROL[key]`, and `barber.depth`'s max is 1 while the base handed to it was
in Q units (5×). On any genre declaring a `barber.depth` motion lane — which
synthwave does — *both* legs were pinned to exactly 1.0. **Restoring the leg
ratio alone would have fixed plastikman and left synthwave dead**, which is
why that clamp was fixed too (see below).

### 7.4 What it is now

- Six **`peaking`** filters, `Q = 2` fixed (≈ half an octave wide, notches an
  octave apart), `gain` at 0 dB. A peaking filter at 0 dB is an *exact*
  bypass, so no value of any control can mute anything, and **DEPTH at the
  bottom of its travel is a dry return rather than a muted one**.
- The window is a **WaveShaper per notch reading the raised cosine off the
  sweep**: the saw already carries `s`, and a memoryless curve turns it into
  that notch's slice of the bell. `CV[j] = 0.5 − 0.5·cos(2π·(i + j/256)/6)`.
- Direction reverses **both at once** — the shapers are fed from the same
  `cents` node the detune is, so a change of DIR cannot turn the stripes
  round and leave the envelope facing the other way.
- Gone with it: the second oscillator, the `ConstantSource` lift, and the six
  phase `DelayNode`s — whose offsets had to be clamped to the 120 s maximum
  and so were silently wrong at slow CLIMB rates anyway.
- `BARBER_CUT_DB = 24` and `BARBER_Q = 2` are `[EAR]`, as §5 already said the
  Q and the envelope width would have to be. The **shape** is sourced; the
  shape is what was wrong.

### 7.5 Measured

Difference signal — the same 16 s excerpt rendered with the pole's return open
and shut, the difference bucketed at half a second and normalised to the whole
render's RMS. `harness/probe_barber.js`, seed 11, both genres, same probe on
both builds:

| | the pole, first 3 s | the pole, last 3 s | samples where the return is bit-silent | |
|---|---|---|---|---|
| synthwave, `2026-08-04s` | −42.5 dB | **−97.7 dB** | 59.2 % | **dies at 6.5 s** |
| synthwave, `2026-08-05a` | −30.1 dB | −25.0 dB | 0.5 % | — |
| plastikman, `2026-08-04s` | −23.3 dB | **−95.4 dB** | 59.2 % | **dies at 6.5 s** |
| plastikman, `2026-08-05a` | −26.9 dB | −23.3 dB | 0.5 % | — |

−97 dB against the mix is the renderer's own float floor: the return is not
quiet, it is **gone**, and it never comes back. 6.5 s is `(7/12)/rate` at the
default CLIMB of 0.09 Hz — the first notch's first trough, exactly as the
arithmetic in §7.3 predicts. The remaining 0.5 % on the fixed build is passages
where the *music* is silent, not the unit.

Two secondary readings worth keeping:

- **synthwave was 12 dB down even before it died** (−42.5 vs plastikman's
  −23.3). That is the `rideBus` clamp of §7.3: synthwave is the genre that
  automates `barber.depth`, so both its legs sat pinned at 1.0 from the first
  sample. It is the loudest single change in this build.
- **plastikman starts 3.6 dB quieter than it did** (−23.3 → −26.9), which is
  correct: the window now genuinely reaches 0 dB of cut at each end of the
  bell instead of Q flailing through zero, so there is less total filtering.
  Less, and continuous, rather than more and then nothing.

---

## SOURCES

*(added 2026-08-05 for §7)*

- [DAFx'15 Barberpole Effects — Aalto, project page](http://research.spa.aalto.fi/publications/papers/dafx15-barberpole/) — "cut-off gains respond to an inverted raised cosine envelope across the frequency spectrum"
- [Q factor & bandwidth in EQ filters](https://rftools.io/blog/equalizer-q-factor/) — `Q = f₀/BW`, `BW_oct ≈ 1/Q` for Q > 2, and notch depth as a gain in dB rather than a Q
- [Implementing barberpole phasing in gen~ — pmdelgado](https://pmdelgado.wordpress.com/2016/04/24/implementing-barberpole-phasing-in-gen-max4live-device/)

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
