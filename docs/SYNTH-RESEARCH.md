# SYNTH RESEARCH — the chip, the keys, the CS-80, and Dilla time

*Web research for upgrading MK2's sound stage. Sources at the foot; [EAR] marks what
only listening can settle.*

## 1. The SEGA chip (YM2612 / Nuked-OPN2)

- **Nuked-OPN2** is the reference: cycle-accurate, based on a YM3438 die shot,
  supports the undocumented behavior (SSG-EG, CSM). License **LGPL-2.1** — fine to
  vendor with attribution. API is six calls (`OPN2_Reset/Clock/Write/Read` + pins),
  which is exactly what MK1's AudioWorklet transpile drove.
- Ports exist (libOPNMIDI wraps it; MK1 carried a mechanical JS transpile in a
  worklet). The emulator is CPU-heavy by design ("requires a very powerful CPU") —
  another reason it must live in an AudioWorklet, never the main thread.
- **Plan**: vendor the worklet as an optional CHIP MODE for the whole palette
  (keys/bass/lead rendered by real 4-op FM patches), carried into MK2 with the three
  lessons the MK1 audit paid for: (1) velocity→TL is logarithmic (0.75 dB/step) — map
  through a dB curve, not linearly; (2) the channel allocator needs time-sorted
  events and a release margin; (3) the offline render must stand up its own chip
  unconditionally or it posts the song to the live one. Scheduled as its own roadmap
  item; it is a subsystem, not a patch.

## 2. Rhodes / Wurlitzer — the soulful keys

The classic result (DX7 "E.PIANO 1", STK's `Rhodey`) is **two FM pairs summed**:

- **Body pair**: carrier at the note, modulator near 1:1, moderate index — the warm
  electric-piano fundamental. Velocity raises the index → the **bark** on hard notes.
- **Tine pair**: carrier at the note, modulator at a HIGH ratio (~14:1; one tutorial
  uses 18:1) with a fast-decaying index — "the harmonics created by the electric
  piano's tine being struck." The ping is bright at the attack and gone in ~150 ms,
  and its brightness scales with velocity.
- **Wurlitzer** differs by flavor: hollower/reedier (odd-harmonic bias → lower odd
  modulator ratio ~3:1), a harder bark, and its signature **tremolo** (~5.5 Hz
  amplitude wobble). [EAR: rhodes vs wurly per song]

This replaces MK2's additive keys stack — a real tine mechanism instead of a static
"sine at 3.97f" partial.

## 3. CS-80 / the Vangelis sound

Architecture facts: 8 voices, and per voice **two complete, parallel synth layers**
(each its own VCO→HPF→LPF→VCA and touch response) — not two oscillators into one
filter. Resonant high-pass + low-pass per layer is a huge part of the color; then
ring mod, ribbon glide, poly aftertouch, and the ensemble chorus on top. The Blade
Runner brass is layered saw/pulse, slow-ish attack, resonant filters opening with
touch, drenched in ensemble.

**Buildable in WebAudio** as a voice: two layers (saw / detuned pulse), each with its
own HP+LP pair, slow attack, late-onset vibrato, and a stereo ensemble detune. Not a
CS-80 emulation — a voice *in its lineage*, honest about the distance. It becomes the
pad/brass-lead for the synthwave/ambient genres and it earns its keep there, not in
lofi. [EAR when its genre arrives]

Open-source note: no usable open CS-80 core exists (the good ones are commercial:
GX-80, CS-80V, XILS); Faust/WebChucK can compile DSP to AudioWorklets if we ever want
deeper modeling. For now hand-rolled WebAudio stays the approach — it kept the whole
program dependency-free.

## 4. Dilla time — the drunken drums

What the analyses actually say (Charnas' *Dilla Time*, Hein's analysis):

- The feel is **deliberate juxtaposition of straight and swung time at once** —
  "rhythmic friction," not looseness.
- Mechanically: **snares/claps slightly EARLY** (the canonical programming trick is
  "move the snare a 32nd early"), **kicks LATE**, hi-hats freehand or straight
  against them ("Get Dis Money": claps a tiny bit early, certain hats late → drag).
- **The deviations repeat identically every bar.** That is the finding that matters
  most for a generator: it is the *precise repetition* of the "wrong" placement that
  magnifies the effect. Random jitter is exactly what it is not.

So the current MK2 swing (uniform ratio + per-note jitter) is NOT the Dilla feel the
user wants — it is generic MPC swing. The correct model, per the research:

```
per SONG (drawn once, then identical every bar):
  snare/ghost offset : -0.10..-0.25 sixteenths   (early; up to the "32nd early")
  kick offset        : +0.06..+0.18 sixteenths   (late; the downbeat kick stays anchored)
  hats               : nearly straight (swing x ~0.25) — the friction layer
  jitter             : ~±2 ms only — the pattern repeats, it does not wander
```
[EAR: the depth of the offsets, and dilla-vs-even weighting per song]

## Sources
- [Nuked-OPN2 — nukeykt/GitHub](https://github.com/nukeykt/Nuked-OPN2/blob/master/README.md) · [libOPNMIDI (LGPL-2.1 wrapper)](https://github.com/Wohlstand/libOPNMIDI) · [Yamaha YM2612 — Wikipedia](https://en.wikipedia.org/wiki/Yamaha_YM2612)
- [FM Electric Piano — Attack Magazine](https://www.attackmagazine.com/technique/tutorials/fm-electric-piano/) · [STK Rhodey class — CCRMA](https://ccrma.stanford.edu/software/stk/classstk_1_1Rhodey.html) · [DX7 Rhodes — Vintage Synth forum](https://forum.vintagesynth.com/viewtopic.php?t=49583) · [DX7 chip reverse-engineering — righto.com](https://www.righto.com/2021/12/yamaha-dx7-chip-reverse-engineering.html)
- [Yamaha CS-80 — Wikipedia](https://en.wikipedia.org/wiki/Yamaha_CS-80) · [CS-80 — HandWiki](https://handwiki.org/wiki/Engineering:Yamaha_CS-80) · [GX-80 announcement — MusicTech](https://musictech.com/news/gear/cs-80-gx-1-cherry-audio-gx80-synth-vangelis-yamaha/) · [Recreating Vangelis on the CS-80 — Synthtopia](https://www.synthtopia.com/content/2025/11/20/recreating-the-iconic-sounds-of-vangelis-on-the-yamaha-cs-80/) · [XILS CS-80 — MusicRadar](https://www.musicradar.com/music-tech/namm-2025-xils-lab-promises-virtual-vangelis-with-its-new-yamaha-cs-80-emulation)
- [Dilla Time — Ethan Hein](https://www.ethanhein.com/wp/2022/dilla-time/) · [Microtiming analysis of J Dilla — Academia.edu](https://www.academia.edu/24528600/21st_Century_Funk_A_Microtiming_Analysis_of_the_Beats_of_Hip_Hop_Producer_J_Dilla) · [Dilla Time techniques — Big Noise Radio](https://bignoiseradio.com/dilla-time-simple-complex-music-production-techniques/)
- [Faust (WASM/AudioWorklet DSP) — grame.fr](https://faust.grame.fr/) · [OpenAudio list](https://github.com/webprofusion/OpenAudio)
