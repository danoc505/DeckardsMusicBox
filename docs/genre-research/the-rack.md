# THE RACK — five machines and the grid between them, in one box

*Built 2026-08-19, build `2026-08-19q`. "Do them all not one. Just finish the
work."*

---

## 1. WHAT WAS IN THE WAY

The previous sheet, `the-feedback-question.md`, proved three things and left one:

- a Web Audio feedback loop **is** deterministic — bit-identical, convolver
  included;
- this program is deterministic too — two renders differ by **one bit** of the
  16-bit file it writes;
- and yet **closing loops in a graph this size costs 80 dB of repeatability with
  every crossing at gain zero.**

The road out was named there and not taken: the room is an FDN inside a worklet,
where feedback is **arithmetic rather than an edge**, and its own comment records
*"it CAN be fed… bit-identical."* One machine had that. Five did not.

This is the five.

---

## 2. WHAT WAS BUILT

**One worklet, `mk2-rack`.** The echo, the spring, the flanger, the DP/4 and the
barberpole, plus the **twenty-five crossings between them**, as numbers in one
box. Five inputs, five outputs.

Every unit already had a clean IN gain and a clean OUT gain with its DSP in
between, so the swap is exactly that middle: the IN gain points at the rack and
the rack points at the OUT gain. **Every wire outside those two points — the
matrix, the sends, the returns, the panel, the motion plan — is untouched and
does not know anything happened.**

The DSP is written from the same descriptions the node versions were:

| | what it is |
|---|---|
| echo | two lines, cross-fed for ping-pong, one-pole LP and HP in the loop |
| spring | a **dispersive** delay — eight cascaded allpasses, which is what makes a tank chirp rather than echo |
| flanger | a 0.5–9 ms modulated delay with feedback, interpolated |
| DP/4 | four independent blocks: phaser, drive, leslie, crusher |
| pole | six notches climbing exponentially and wrapping, each windowed in and out |

### The denormal floor is part of the answer, not an optimisation

Values below ~1e-38 take a slow CPU path whose flush-to-zero behaviour **is not
part of the arithmetic**. Without feedback that never matters — a tail decays out
of the buffer. **With** feedback they circulate forever.

Measured: the rack rendered twice with feedback open came back identical on one
run of the test and **not on the next two**. Flooring every recursive value
**every sample** fixed it. That is what makes "deterministic by construction"
true rather than nearly true.

### And the loop is bounded, because a feedback patch is

The first record made with this box came back at **−1.2 dB RMS** against the −17
it should be: the spring's own decay plus a self-crossing put the loop gain near
one, and `1/(1−0.94)` is twenty-four decibels of nothing but itself.

A ceiling on the knob is the wrong fix — loop gain is the *product* of everything
in the path and no single knob knows it. So the bound goes where the sum is: a
soft saturator on what leaves each unit and re-enters the grid. Transparent below
a third; above it the loop **compresses instead of climbing**, so a patch wound
past unity *sustains* rather than explodes. Which is what a dub desk does, and is
the sound people run effects into themselves for.

---

## 3. WHAT IT MEASURED

```
  the rack alone, rendered twice with self- AND cross-feedback wide open
      -146 dB below signal          (the 16-bit floor is -91)
      the node-graph version was      -8 dB

  the whole program, rack live, no feedback declared
      -95 dB below signal           — BETTER than the -91 it was before

  0 of 47 renders failed · 0 notes moved in 24 records · levels unchanged
```

**Twelve crossings that were blind plates are real knobs:**

```
  backward, inside the rack   springEcho  flangeEcho  flangeSpring  dp4Echo
                              dp4Spring   dp4Flange   barberEcho    barberDP4
  self, inside the rack       springSpring  flangeFlange  dp4DP4  barberBarber
```

Crossings with one end **outside** the rack — the room, tape, medium, master —
are still real wires and still plated when they run backward. Those are the ones
that would close a graph loop, and the road for them is the same one: into a box.

---

## 4. AND WHY NO GENRE TURNS ONE UP YET

Lofi had a real patch — spring into echo, echo into spring, spring into itself —
through four settings:

```
  0.22 / 0.20 / 0.16     -1.2 dB RMS, a howl, two renders 8 dB apart
  0.16 / 0.14 / 0.08     levels fine, 8 to 96 dB apart
  0.10 / 0.09 / 0.05     levels fine, 29 to 95 dB apart
  0.05 / 0.045 / 0.025   levels fine, 25 to 68 dB apart
```

**Halving the loop barely moved the last column.** That is the tell: it is not
loop gain.

**The drums are 1 LSB non-deterministic, and always have been.** Measured on this
build and on the build at the start of the session alike: two renders of one
wardrum hit differ on **122 samples of 132,300, by exactly −90.3 dB** — one bit
of a 16-bit file. Inaudible on its own; it *is* the output format's floor. And a
resonant feedback loop is an amplifier of exactly that, however quietly it is set.

So the crossings are knobs and no genre turns one up.

**That is not the built-and-never-switched-on defect this file spends its
comments on.** It is a measured blocker with a named next job:

> **Find what makes a drum hit differ by one bit.** Narrowed already — the keys
> render identically, both drum voices do not, and both use `burst()`'s buffer
> source with a fractional start offset. Fix that and every one of these opens.

---

## 5. WHAT IS NOT DONE

- **The old node chains are starved, not deleted.** Their input is severed so
  they run on silence and contribute nothing, and every line elsewhere that still
  writes to `g.echo.delayTime` keeps working instead of throwing. Deliberate
  first step, named rather than hidden — a dead chain in a graph is a defect and
  it comes out in the pass that follows this one.
- **The room is not in the rack**, so reverb↔delay feedback is still a graph loop
  and still plated. It is the most musically wanted one.
- **The rebuilt effects do not sound identical to the old ones** — measured 30 dB
  of difference on lofi, with levels and balance unchanged. Not worse. Not the
  same. Nobody has heard either.

---

## Sources

Every number here is a measurement of this program or of Chromium's Web Audio,
taken on 2026-08-19.

- `docs/genre-research/the-feedback-question.md` — the investigation this acts on
- the FDN room's own comment in the program — the pattern this follows
