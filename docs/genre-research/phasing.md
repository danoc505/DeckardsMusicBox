# TWO COPIES OF ONE MOVEMENT, ONE SLIGHTLY SLOWER

*Researched, measured and built 2026-08-08. Item 3 of the five in
`static-harmony-and-evolution.md` §4.*

---

## 1. I WAS WRONG ABOUT WHAT WAS MISSING, AND THE MEASUREMENT SAID SO

What I wrote in §4:

> **No phase relationship between two patterns.** Everything is independent and
> free-running. Two lanes at 15 and 16 bars would drift in and out over 4
> minutes, which is generative-modular's core trick.

The second sentence is right. **The conclusion I drew from it was not.** I
assumed every slow movement was locked to a tidy 16/32/64-bar grid, so they all
kept re-syncing. Measured over 30 songs a genre — every pair of `lfo` lanes,
asking whether the pair ever returns to where it started inside one record:

```
  genre           pairs that NEVER re-align during the record
  dungeon synth        96%
  lofi                 92%
  vgm                  89%
  synthwave            83%
  bladerunner          68%
  minimal techno       58%
  jungle               26%
  acid                 16%
```

**Six of eight genres were already almost entirely aperiodic.** The thing I said
was absent was mostly there.

## 2. WHAT WAS ACTUALLY MISSING — aperiodic is not phasing

> "Two musicians begin in unison playing the same pattern over and over again,
> and while one of them stays put, the other **gradually increases his or her
> tempo so as to slowly move one beat ahead of the other**. This process is
> repeated **until both players are back in unison**."
> — [Wikipedia, *Piano Phase*](https://en.wikipedia.org/wiki/Piano_Phase)

Four conditions in that sentence, and only one of them is "different rates":
**the same pattern**, **beginning in unison**, **nearly the same rate**, and
**returning**. Seventy-seven unrelated movements at unrelated rates on unrelated
destinations satisfy none of the other three. They produce movement that does
not repeat, which is not the same as two things the person playing it can hear beating
against each other.

Measured — destinations anywhere in the file carrying two `lfo` lanes at nearly
the same rate (inside a 1.35 ratio):

```
  minimal techno    9 destinations with two lanes ... 0 of them a near pair
  every other genre                                   0
```

**Zero, in all eight genres.** That is the real gap, it is much narrower than I
claimed, and unlike the two items before it, it was missing *everywhere*.

The related practice says the same thing in modular terms: multiple modulation
sources "running at slightly different rates to create slow phase shifts that
prevent exact repetition", and polymetric patterns "move in and out of alignment
at a rate that depends on the least common multiple of their lengths"
[technique summaries via search; ⚠ **forum/blog material, not primary**].

## 3. WHAT WAS BUILT

A **phase twin**: a second copy of a movement — same shape, same depth, same
starting phase, running a few percent slower. Two lanes on one destination
already sum, so the pair swells to double depth where they agree and cancels
where they oppose.

**The beat completes in `bars / detune`.** That single line of arithmetic is what
the genre tables are choosing when they set `detune`, and it is what decided
where this device could go at all.

## 4. AND THE ARITHMETIC REMOVED TWO OF MY FIVE CHOICES

I declared it on five genres. Then I measured the realised beat periods against
the records they have to fit inside:

```
  genre           destinations paired   median beat   record   ratio
  minimal techno         43%              346 bars    264      1.3   KEPT
  jungle                 18%              184         291      0.6   KEPT
  acid                   17%              195         250      0.8   KEPT
  dungeon synth          17%              805         162      5.0   REMOVED
  bladerunner            32%              762          80      9.5   REMOVED
```

**Blade Runner and dungeon synth cannot use this device**, and the reason is not
taste. Their movements are already 60–100 bars long inside records of 80 and 162
bars — the movement itself barely cycles once. A pair would traverse a tenth of
its beat before the music ended: a constant slight offset, not drift. Making it
fit would need a detune near 1.0, which is not a twin running slightly slower,
it is a second oscillator at another speed, and that is a different device with
no source behind it. **I had written both declarations with reasons I believed
before the numbers arrived.**

**Of the three that stayed, only one is sourced; two are judgement calls, and
the tables say so.**

- **minimal techno** — the strong one. Reich's phase pieces are the founding
  minimalist process, this genre is minimalism with a kick under it, and the
  user's own brief was *"it should be more like generative modular"*.
- **acid** and **jungle** — **on a measurement, not a source.** Nobody describes
  either in terms of phasing and I did not find anyone who does. They are here
  because they are the two most locked genres in the file (16% and 26% against
  58–96% elsewhere), and the sourced half of the device — a beating pair is the
  cheapest aperiodicity there is — applies whatever the label on the record.
  **The user's to overrule.**

lofi, synthwave and vgm were left alone: already 83–92% aperiodic, and no source.

## 5. THE PROOF IT SOUNDS

One destination in a minimal techno record (`dp4.aLvl`, seed 3): base lane 46
bars, twin 51.5 bars — 11.9% slower, beat period 385 bars against a 304-bar
record. The swing of the combined movement, per 30 bars, against the base lane
alone as a same-build control:

```
  bars        with the twin       base alone
     0- 30       0.210               0.119
    30- 60       0.272   <- agree    0.154
    60- 90       0.262               0.155
    90-120       0.224               0.124
   120-150       0.138               0.150
   150-180       0.092               0.155
   180-210       0.045               0.139
   210-240       0.023   <- cancel   0.141
   240-270       0.066               0.155
   270-300       0.130   <- returning 0.149
```

The control is flat at ~0.15 for the whole record. The pair runs from **0.27 to
0.023 and back** — nearly double depth to nearly nothing, and returning. That is
the process in the source, on a knob.

## 6. WHAT THIS DOES NOT SETTLE

- **Nothing has a verdict.** Every note in the file is untouched — the snapshot
  is byte-identical across 2400 songs, correctly, because motion never moves a
  note. The whole change is in how the knobs travel, which is exactly the layer
  no measurement of mine can judge.
- **acid and jungle are judgement calls** made on a measurement of staleness
  rather than on anybody's description of the genre.
- **The twin copies depth exactly.** Reich's second pianist plays the same
  dynamics; a hardware pair would not match perfectly. Whether the twin should
  be slightly quieter is unknown and untested.
- **Two genres are now provably out of reach of this device**, and if their
  movement should drift the answer has to be something else — a shorter base
  movement, or a different mechanism entirely.
