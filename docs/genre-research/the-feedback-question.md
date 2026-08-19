# THE FEEDBACK QUESTION — taken apart, with a control

*2026-08-19. The owner, twice, and then a third time that landed:*

> "Why are you telling me something can't be done because of the program's past
> failure to properly code? **Is there a good reason for this?**"

He was right to push. The reason written in the file was wrong in every
particular. The limit turned out to be real anyway — but nobody had ever
measured it, and what they *had* measured was a rounding error.

---

## 1. WHAT THE FILE SAID

> "signal only flows forward along `MATRIX.order` … a cycle costs the renderer
> its repeatability (**measured: −35 dB vs −115 between repeat renders**)"

and elsewhere, blaming a specific node:

> "A cycle through a **ConvolverNode** makes Chromium render the same song
> differently every time."

Fifteen crossings were blind-plated on that. Every backward path — reverb into
delay, spring into echo — the whole feedback half of a matrix mixer, which is
the thing the grid's own citations say a matrix is *for*.

---

## 2. ALL OF IT WAS WRONG

**A Web Audio feedback loop is deterministic.** An oscillator, a delay, a filter,
a cycle, rendered offline three times:

```
  feedback   run1 vs run2   run1 vs run3   bit-identical
   0            -381.8 dB      -381.8 dB       yes
   0.5          -382.9         -382.9          yes
   0.85         -389.3         -389.3          yes
   0.97         -404.1         -404.1          yes
```

**Even with a convolver in the loop** — the node the old claim named:

```
  filter      0.6 / 0.95 / 1.02      bit-identical
  convolver   0.6 / 0.95 / 1.02      bit-identical
```

**And this program is deterministic too.** Two renders of a single wardrum hit:

```
  132,300 samples · 122 differ · worst -90.3 dB
```

**−90.3 dB is 1/32768 — one bit of the 16-bit wav the harness writes.** It is the
output format's rounding floor. Reading it as the program wavering is where the
"−35 dB" came from: a feedback path amplifying one bit.

*Third time this session that a measurement, not the program, was the thing at
fault. It has its own line in this repo now: when a measurement surprises you,
suspect the measurement first.*

---

## 3. AND THEN THE LIMIT TURNED OUT TO BE REAL — WITH A CONTROL

The plates came off. Dungeon synth was given a real feedback patch — reverb into
delay — and rendered twice. It fell apart: **−3.5 to −15.7 dB** against a −91 dB
floor.

Blamed the loop gain. Moved the loop off the room (whose tail is near-unity by
construction) onto echo↔spring. **Still fell apart.**

**Then ran the control that should have come first: removed the feedback
entirely and rendered twice anyway.**

```
  dungeon synth, seed 1, two full renders, nulled

    plates in place ...............................  -88.8 dB   clean
    plates removed, EVERY backward crossing at
    GAIN ZERO — no genre declares one .............   -8.1 dB   80 dB worse
```

**The gain is zero in the second row.** Nothing is routed. The only difference is
that thirty-four crossings now *exist as nodes*, so the graph contains loops.

**Merely closing the loops — silently, at zero — costs this graph eighty
decibels of repeatability.** A small graph with one cycle is bit-identical; this
one, with hundreds of nodes and thirty-four new loops, is not.

So the plates stay. Law 7 is why: same seed, same samples.

---

## 4. WHAT ACTUALLY CHANGED

**The false reason is gone.** The plate text now says what is true: not that
feedback is unrepeatable — it demonstrably is not — but that closing loops in a
graph this size costs repeatability even at zero gain, measured against a
control on a stated date.

**And the program can now be asked which room it rendered with.** `probeRoom()`
reports whether an *offline* graph got the FDN worklet or the convolver
fallback. The transport could always say it for the live graph and nothing could
ask it of the graph every measurement in this repo is actually made with — a gap
that nearly let this whole investigation be written up without knowing what was
in the loop. (It was the worklet. Confirmed.)

---

## 5. THE ROAD OUT, AND IT IS NOT A GUESS

The room already solved this. It is an FDN inside an AudioWorklet, where the
feedback is **arithmetic inside one box** rather than an edge between nodes — and
its own comment records the result: *"it CAN be fed… deterministic by
construction… repeat renders are bit-identical (−316 dB)."*

That fix was applied to **one** machine. The echo, spring, flanger, DP/4 and pole
are still node graphs, and a loop through any of them is a loop through the
graph.

**Moving them inside worklets is the road, and it is understood work rather than
risky work, because there is a finished, measured example of it in the same
file.** It is also a large job: five DSP rewrites, one of them a convolution.

That is the honest position. Not "it can't be done." **Not done yet, for a
reason that is now measured instead of inherited.**

---

## Sources

Every number here is a measurement of this program or of Chromium's Web Audio,
taken on 2026-08-19 with the tools left in `harness/`. The claim it replaces had
none.

- the FDN room's own comment in the program — the proof that worklet feedback is repeatable
- `docs/genre-research/a-crossing-is-a-knob.md` — the earlier, weaker version of this experiment, superseded here
