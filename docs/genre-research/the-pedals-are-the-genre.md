# The pedals are the genre — sourced, 2026-08-21

> "It is not a wall of sound and distortion about all it does is increase the
> pitch! No fuzz no degradation no deepening of the sound. All your pedals suck
> ... I can not believe for one second that doom and sludge are 2 pedals! Did
> you bother to try and source how to build these pedals? Did you look online
> for open source versions? This is not even close" — the owner, with a link to
> [guitarpedalx, 9 of the best compact doom/drone/sludge/stoner fuzz pedals]

Every complaint was correct and every one of them is answered below with the
measurement that proved it.

## 1. The list he sent, and what it settles

| pedal | circuit | controls the author names |
|---|---|---|
| Blackhawk Balrog V3 | cascading TL072 JFET opamps | Volume, **Mids**, Gain, Treble, Bass, **Depth** |
| D*A*M M-13 Meathead | **two unmatched silicon transistors** | one knob |
| Earthbound Supercollider | Big Muff style | Tone, **Mids**, **Mass**, Level, Gain |
| Greenhouse Sludgehammer | opamp | Volume, Gain, mode, Tone, **Body** |
| MidValleyFX Mad Robot | fuzz + droning oscillator/**octave** | volume, presence, octave intensity, mode |
| Minotaur Mud Giant | **Fuzz Face style**, high-gain silicon | Level, Mud, tone switch |
| Nine of Swords Tyrant | **Meathead-style** (2N3904 + BC182L) | one knob |
| Occvlt Furious Dope | **Fuzz Face style**, unmatched transistors | Tone, Loud, Doom, clipping switch |
| Sunmachine Fuzz O))) | **Meathead clone, Dark variety, + low-pass** | Dirt, **Low**, mode |

**Five of the nine are Fuzz Face derivatives. Two are Muffs.** The program had
one Muff. That is the "2 pedals" complaint, and it is arithmetic.

**Seven of the nine sell a knob for putting the middle or the bottom back** —
Mids, Depth, Mass, Body, Low, Mud. A stock Muff is scooped; these pedals exist
because of it. The program had no such control at all.

Sound targets quoted: Supercollider *"huge low end component - perfect for
sludge"*; Fuzz O))) *"like the feeling of wading through molten lava,
congealing tar or treacle"*; Balrog *"one of the very best heavy sludge
machines"*.

## 2. The Big Muff tone stack, with the numbers

Ram's Head (1973): treble leg **33k + 0.004 µF → 1206 Hz**, bass leg
**33k + 0.01 µF → 482 Hz**, the tone pot blends the two
[coda-effects, *Big Muff tonestack: dealing with mids frequencies*]. Their
interweaving *"introduces a middle-frequency scoop/notch at 1 kHz when the
potentiometer is set to the middle position... attenuated around 13 dB"*
[electrosmash, *Big Muff Pi Analysis*].

**What the program had: 560 Hz and 2100 Hz.** The bass leg was close; the
treble leg was an octave too high, which is not a 1 kHz notch — it is a hole
from 560 Hz to 2.1 kHz with everything above let straight through. Thin and
fizzy, which is what he heard.

The Muff is *"4 cascaded common emitter amplifier stages... Input Booster,
Clipping Stage, Passive Tone Control and Output Booster"* and *"three out of
four stages include feedback resistors and **Miller capacitors**, which
stabilize the behavior and frequency response"* [ibid]. The program's two
clipping stages had no Miller rolloff, so stage two clipped stage one's raw
square edges at full bandwidth.

The mids fix is the AMZ mod: *"replace R5 with a resistor plus a
potentiometer... lowering the resistor value reduces the high-pass cutoff
frequency, **recovering midrange content**"* [coda-effects].

## 3. The Fuzz Face, which is the other circuit

*"The emitter of the second transistor is linked directly to the base of the
first one through a 100k resistor"* — *"the main interest of the circuit"*
[coda-effects, *Sunface / Fuzzface circuit analysis*].

**It keeps its bass.** Stock input cap 2.2 µF; the Analogman Sunface mod drops
it to 1 µF to make *"a brighter fuzz"* with *"reduced low-end response"*
[ibid]. The bright one is the modification.

**It gates.** *"Skew the bias point so that Q2 saturates... the feedback loop
is broken and Q2's gain approaches zero. The precipitous drop in Q2's gain
kills the guitar signal and we have gating. That ripping velcro tone is
saturation setting in"* [geofex, *The Technology of the Fuzz Face*]. Bias Q1
too low and you get *"starved Q2: gated decay, sputtery, volume drop"*
[pedalpcb, *Biasing BJTs part 3*].

**It has an output coupling cap.** *"A simple 0.1 µF coupling capacitor to
eliminate DC current"* [coda-effects]. This is not decoration — see §6.

**Asymmetry, the open-source way.** Faust's `ef.cubicnl` in `misceffects.lib`
takes *"an offset for bringing in even harmonics"*, and guitarix uses it
[faustlibraries.grame.fr; dsprelated, *Physical Audio Signal Processing*,
Nonlinear Distortion]. Other open-source references read while building:
`JP01/Fuzzed` (state-space Fuzz Face), `brummer10/GxKnightFuzz.lv2`,
`andrepxx/go-dsp-guitar`, `chowdsp_wdf` (wave-digital diode clippers).

## 4. The octave divider, and why the old one was backwards

*"Octave dividers use a flip-flop circuit which changes its state on each
leading edge of the input signal, which implies that the output takes the form
of a square wave"*; *"a flip-flop produces an output of exactly half the input
signal frequency, which is one octave lower. Multiple flip flops are used for
deeper octaves"* [electronicmusic.fandom, *Octave divider*; allaboutcircuits].

*"A digital IC does not pass amplitude variations from its input to its
output — whatever shows up on the Clock pin, the output will be a square wave
if the input is loud enough, or nothing if it isn't. So no matter how much
signal filtering you do before the 4013, it is going to have a serious fuzz
effect after. This can then be low-passed to make less harmonics."* [ibid]

*"They are ok for single notes but not chords."* [ibid]

Doom wants down: *"pedals pitched one or two octaves down for maximum
heaviness"* [boostguitarpedals, *How to get a crushing doom metal tone*].

**The program's `makeOctave` is `|x|·2−1` — a full-wave rectifier, which is an
octave UP.** Doom and sludge declared it at 0.22 and 0.34. So the only pedal
move the heavy half of this record made was to raise the pitch. That is
literally the owner's first sentence.

## 5. Gain structure and EQ

*"A high powered amp set pretty clean"* with the pedals doing the heavy
lifting; minimum 50 W, 4x12s *"to handle low frequencies"*; C standard is
*"perhaps the most common tuning for Doom today"*; Big Muff types for their
*"beefy low end, scooped mids and plentiful gain"*; a compressor is
*"essential for sustaining droning notes"* [boostguitarpedals].

Mids are contested and the genre splits: *"gritty, filled with mids"* through
*"classic tube-driven distortion"* on one side, *"more scooped, cutting some of
the mids to feel distant and spooky"* on the other [samash; sevenstring].
This record takes mids on the doom and sludge acts and scoops the fight.

HM-2 territory, for the low shelf: the Doomsaw is *"a gruesome single knob
adaptation of the dimed HM-2 chainsaw circuit"* whose *"increased and extended
Low EQ combines with a modified High EQ for a pummeling chainsaw dirge with
reduced high frequency harshness"* [doesitdoom].

## 6. What was measured while building it — the four faults, in order found

All on doomsludge seed 1, notes read off the printout rather than assumed. The
sludge act's bass plays **C#1 and E1 — 34.6 and 41.2 Hz**.

**a. The tone stack deleted every harmonic the clipper made.** Bass alone with
the board in: 92.9% of its energy in 20–60 Hz, 1.6% between 120 and 250, and
26 dB louder than bypass. A clipper turns 35 Hz into harmonics at 70, 104, 138,
173; the stack's low leg threw all of them away. Fixed by moving MASS out of
the wet path — the clean fundamental now sits *beside* the dirt, which is how a
bass fuzz has always been built, and TONE came up so the treble leg carries the
grind.

**b. The Meathead had no output coupling cap.** An asymmetric transfer curve
has a non-zero mean by definition, so a symmetric input came out with a DC
offset riding the note's envelope. Bass alone, that pedal only: **99.2% of its
energy in 20–60 Hz, rms 0.277 against a raw bass of 0.018.** Twenty-four
decibels of nothing you can hear. The 48 Hz cap and a normalised (not clamped)
curve fixed it.

**c. The drive law was calibrated on a test tone, not on the program.**
`pre = 60^sustain` reaches the tanh knee on a full-scale sine. The role
subgroup peaks around 0.055, and the knee is near 0.5, so 27× landed at 1.4 —
barely into the bend. Measured: the bass with only the Fuzz Face on came back
98.8% at the fundamental. **It was a clean boost with a curve drawn on it.**
Rescaled to `3·320^s` and `3·260^dirt`.

**d. The divider was 20 dB too loud and an octave below hearing.** The 4013's
constant amplitude is faithful to the chip and wrong on a subgroup: ±0.55
against a part peaking at 0.055 is four times louder than what it tracks. And
an octave below C#1 is 17 Hz. Fixed twice over — the output rides the input
envelope, and the pedal moved to `lead` (A3–F#5), the one monophonic part and
the one in guitar register.

Also found and fixed: a speaker is a **bandpass**, not a low-pass. `cab` had no
low rolloff, so the clipper ran to DC; 65% of the doom act's energy landed
below 60 Hz. A 4x12 cannot do that.

## 7. What the record measures now

Full mix, seed 1, the busiest section of each act, 8192-point FFT, energy per
band, after minus before:

```
                 20-60  60-120  120-250  250-500  500-1k   1k-2k   2k-4k    8k+
doom              -0.2    +0.9     -6.7     +1.6    +8.5   +10.1    +9.4   +8.6
sludge            +0.1    +0.1     -0.3     +0.5    +5.8    +6.5    +4.6   +2.7
the fight         +0.2    +0.4     +4.8     +6.1   +11.0   +10.7   +11.7  +16.4
the long way home  0.0     0.0      0.0      0.0     0.0     0.0     0.0    0.0
```

The walk home is untouched by design — it is the Gilmour act and it has no
fuzz. Peak levels unchanged (0.61 / 0.84 / 0.82), so this is harmonic content
rather than a level grab.

## 8. What is still open

- **The HM-2 chainsaw** is sourced above and not built. It would be a third
  clipper with dimed low and high shelves in front of it.
- **The phaser stays** on the owner's word (*"why would we want a phaser we
  already have phasing effects, but you built it so ok"*) and is not developed
  further; the flanger, the barberpole and the DP/4 are the program's phasing.
- **Sag** — a dying-battery supply droop — is named in the sources and is not
  built. It needs an envelope-driven bias, which is a worklet.
