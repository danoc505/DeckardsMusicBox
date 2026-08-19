# The rack was never plugged in

*2026-08-19. Written the hour the owner said "roll it back … they are broken
and its messed with the whole of the program".*

He was right, and the reason is worse than a wrong number.

## What was wrong

`buildGraph` builds the rack like this:

```js
if(g.rackReady){
  g.rack = new AudioWorkletNode(c, "mk2-rack", { … });
  const RIN  = [g.echoSend, g.springIn, g.flangeIn, g.dp4In, g.barberIn];
  const ROUT = [g.echoPan,  g.springOut, g.flangeOut, g.dp4Out, g.barberOut];
  for(let i = 0; i < 5; i++){
    if(!RIN[i] || !ROUT[i]) continue;          // ← every single one
    …
  }
}
```

That block is at line 11659. `g.springIn` is created at 11762, `g.echoSend` at
11851, `g.echoPan` at 11899, `g.flangeIn` at 12098, `g.dp4In` at 12146,
`g.barberIn` at 12271. **Read from 11664, all ten are `undefined`.** The guard —
written to be careful — skipped all five connections without a word.

So for three builds the rack was constructed, its twenty-five crossing
parameters were written to it every song, `probeRoom()` reported
`rack: true` … and it was **connected to nothing**. The five effects went on
running on the old node chains they were supposed to have replaced.

## How it was found, and why nothing else could have found it

Make every rack output emit a full-scale 440 Hz tone and render a lofi excerpt:

| comparison | difference |
|---|---|
| the shipped build vs itself, two renders | −31.7 dB |
| the shipped build vs **the rack screaming a 440 Hz tone** | −31.7 dB |

A box at full level into the mix changed the record **no more than rendering
the same file twice did**, because nothing was listening to it.

Every other check passed. The page loaded, `probeRoom` said the module was
there, 88 renders came back without an error, the score harness was
byte-identical, and every genre made sound — because the old chains were still
doing the work. A feature can be entirely absent and leave no mark on any test
that asks "did it break something".

## What the owner was actually hearing

Two things, both real:

**The crossings were doubled.** With the rack inert, the only working
implementation of "the effects feed each other" was the generic matrix loop,
which builds a real gain node for every crossing. lofi opens echo→spring at
0.3; that arrived through the node wire — and would have arrived through the
rack's grid as well the moment the rack was plugged in. Two paths, one knob.

**And every one of those nodes closed a graph cycle.** `echoSpring`'s node runs
`g.echoPan` → `g.springIn`, which with the rack connected is rack output 0 into
rack input 1. This file already carried the measurement for what merely closing
such a loop costs. Here is what it cost: **one lofi excerpt rendered eight
times gave eight different files**, differing about 30 dB below signal. Law 7 —
same seed, same samples — was being broken by a duplicate.

## The fix

1. **The wiring moved to after all ten endpoints exist**, and it now `throw`s
   instead of skipping. A guard that continues past a missing node is how this
   hid for three builds; the graph either wires up or the build fails loudly.
2. **A crossing with both ends inside the rack no longer gets a node.** It is
   `x[j] += g * y[i]` inside the worklet and nothing else.

Measured after:

| check | before | after |
|---|---|---|
| rack in the signal path (tone test) | −31.7 dB, i.e. absent | **+10.5 dB** |
| one excerpt, eight renders, worst pair | −29.4 dB | **−97.1 dB** (the 16-bit floor) |
| echo→spring crossing, shut vs 0.7 | — | −35.7 dB against a −116 dB control |
| echo→DP/4 crossing, shut vs 0.7 | — | −35.3 dB against a −111 dB control |
| notes changed, 4 genres × 6 seeds | — | **0 of 24** |
| mix level, 4 genres | — | −0.4 to +0.2 dB rms |

This is the first build in which the rack's own DSP is heard at all.

## The lesson, and it is not the one about feedback

`if(!x) continue` is not caution. It is a decision to carry on in a state the
author did not expect, and the state the author did not expect is exactly the
one worth stopping for. Three builds of work, a worklet, twenty-five
parameters, a documentation file and two arguments with the owner about why the
effects could not feed each other — all downstream of five connections that
were silently skipped.

The owner's instinct was better than the test suite's. "They are broken and its
messed with the whole of the program" was, precisely, true.
